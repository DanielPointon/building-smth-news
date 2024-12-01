import traceback

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Union
from pydantic import BaseModel, RootModel
import json
from pathlib import Path
import random
from openai import Client
import uuid
from fastapi.responses import JSONResponse
from typing import Optional
import openai
from functools import lru_cache

app = FastAPI()
router = APIRouter()

OPENAI_API_KEY = json.loads(open("secrets.json").read())["OPENAI_API_KEY"]

client = Client(api_key=OPENAI_API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB_PATH = Path("database.json")
DB_PATH = Path("database.json")

with open(DB_PATH, "r") as db_file:
    print(db_file)
    database = json.load(db_file)

if "articles" not in database:
    database["articles"] = {}
if "questions" not in database:
    database["questions"] = {}

# print(database)


def save_database():
    def pydantic_to_serializable(obj):
        # if obj has attribute metadata
        """Helper function to handle Pydantic models."""
        if isinstance(obj, BaseModel):
            return obj.model_dump()  # Convert Pydantic models to dictionaries
        elif isinstance(obj, (list, tuple)):
            return [pydantic_to_serializable(item) for item in obj]
        elif isinstance(obj, dict):
            return {key: pydantic_to_serializable(value) for key, value in obj.items()}
        return obj  # Return the object as-is if not Pydantic

    with open(DB_PATH, "w") as db_file:
        json.dump(pydantic_to_serializable(database), db_file, indent=4)


class ImageContent(BaseModel):
    image_url: str
    image_caption: str


class TextContent(BaseModel):
    text: str


class ArticleMetadataRequest(BaseModel):
    article_id: str


class ClusterRequest(BaseModel):
    question_id: str


class ArticleContent(RootModel[Union[TextContent, ImageContent]]):
    """
    Article content can be either a string (text) or an image with caption.
    """

    pass


class QuestionInput(BaseModel):
    id: int
    text: str
    metadata: dict


class QuestionMetadata(BaseModel):
    tags: List[str]
    related_topics: List[str]


class QuestionWithLink(BaseModel):
    question: str
    question_id: Optional[str] = None
    metadata: QuestionMetadata
    index_in_article: Optional[int] = None


class GeneratedQuestions(BaseModel):
    questions: List[QuestionWithLink]


class ArticleInput(BaseModel):
    id: Union[str, None]
    title: str
    description: str
    main_image_url: str
    author: str
    published_date: str  # ISO 8601 format (e.g., "2024-11-30")
    content: List[ArticleContent]
    metadata: dict  # Includes fields like countries and other dynamic metadata
    questions: List[QuestionInput]


class Event(BaseModel):
    event_title: Optional[str]
    event_date: Optional[str]  # "YYYY-MM-DD" or None
    article_id: int


class ExtractedEvents(BaseModel):
    question_id: int
    events: List[Event]

class ClusterArticle(BaseModel):
    title: str
    author: str
    published_date: str
    description: str

class Cluster(BaseModel):
    cluster_topic: str
    article: ClusterArticle


class ClusteredSubtopics(BaseModel):
    clusters: List[Cluster]


@router.post("/articles/create")
async def create_article(article: ArticleInput):
    """
    Create a new article with detailed question data and metadata. If a question already exists
    (based on text and metadata), link the article to the existing question.
    """
    print("Creating article...")
    article.id = uuid.uuid4().int

    def pydantic_to_serializable(obj):
        """Helper function to handle Pydantic models."""
        if isinstance(obj, BaseModel):
            return obj.model_dump()  # Convert Pydantic models to dictionaries
        elif isinstance(obj, (list, tuple)):
            return [pydantic_to_serializable(item) for item in obj]
        elif isinstance(obj, dict):
            return {key: pydantic_to_serializable(value) for key, value in obj.items()}
        return obj  # Return the object as-is if not Pydantic

    # Add the article to the database
    new_article = {
        "id": article.id,
        "title": article.title,
        "description": article.description,
        "author": article.author,
        "main_image_url": article.main_image_url,
        "published_date": article.published_date,
        "content": [item.root for item in article.content],  # Flatten content
        "metadata": await get_article_metadata(article),
        "questions": [],
    }

    questions = await generate_questions_for_article(article)
    article.questions = questions["questions"]

    # Process each question in the input
    for question in article.questions:
        # Check if the question already exists
        if question.question_id in database["questions"]:
            matching_question = database["questions"][question.question_id]
            # If the question exists, link the article to the existing question
            if article.id not in matching_question["article_ids"]:
                matching_question["article_ids"].append(article.id)
            new_article["questions"].append(
                {
                    "id": matching_question["id"],
                    "question": matching_question["question"],
                    "index_in_article": question.index_in_article,
                }
            )
        else:
            # If the question doesn't exist, create a new one
            new_question = {
                "id": str(uuid.uuid4().int),
                "question": question.question,
                "metadata": pydantic_to_serializable(question.metadata),
                "article_ids": [article.id],
            }
            database["questions"][new_question["id"]] = new_question
            new_question_article = {
                "id": new_question["id"],
                "question": new_question["question"],
                "index_in_article": question.index_in_article,
            }
            new_article["questions"].append(new_question_article)

    database["articles"][article.id] = new_article
    # Save the database
    save_database()

    return {
        "article_id": article.id,
        "message": "Article and associated questions created/linked successfully.",
    }


@router.get("/articles/{article_id}")
async def get_article(article_id: str):
    """
    Article content can be either a string (text) or an image with caption.
    Fetch a specific article by ID from the database.
    """
    article = database["articles"].get(article_id, None)

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return article


@router.get("/homepage")
async def get_homepage_articles():
    """
    Fetch a list of articles from the database to display on the homepage.
    """
    home_articles = list(database["articles"].values())[0:30]
    for article in home_articles:
        article["id"] = str(article["id"])

    return home_articles


async def get_article_metadata(article: ArticleInput):
    """
    Generate metadata for an article using GPT-4o.
    Metadata includes a list of countries and other dynamic attributes.
    """
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    flattened_content = flatten_article_content(article.content)

    prompt_metadata = f"""
    Analyze the following article content:
    {flattened_content}

    Extract metadata including:
    - "countries": A list of country codes relevant to the article (e.g., ["US", "FR"]). Leave this empty if no countries are relevant.
    - Other relevant metadata that could be useful for classification (i.e. fields like "tags", "topics", "concepts" etc).

    Provide the result in JSON format:
    {{
        "countries": ["US", "FR"],
        "other_dynamic_field": "value"
    }}
    """

    response_metadata = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt_metadata}],
        response_format={"type": "json_object"},
        max_tokens=200,
        temperature=0.7,
    )
    metadata = response_metadata.choices[0].message.content
    try:
        metadata = json.loads(metadata)
    except json.JSONDecodeError:
        metadata = {}
    return metadata


@router.get("/questions/country/{country_code}", response_model=List[dict])
async def get_questions_by_country(country_code: str):
    """
    Get questions related to a specific country based on the metadata of associated articles.
    """
    related_articles = [
        article
        for article in database["articles"].values()
        if country_code in article["metadata"].get("countries", [])[:3]
    ]

    all_questions = []

    for article in related_articles:
        if "questions" in article:
            all_questions.extend(article["questions"])

    return all_questions


def flatten_article_content(content: List[Union[str, dict]]) -> str:
    """
    Flatten the article content into a single text block for processing with GPT.
    Includes text content and captions for images.
    """
    flattened_content = []
    for item in content:
        # Handle Pydantic models
        if hasattr(item, 'root'):
            if isinstance(item.root, TextContent):
                flattened_content.append(item.root.text)
            if isinstance(item.root, ImageContent):
                flattened_content.append(item.root.image_caption)
        # Handle dictionary content from database
        else:
            if "text" in item:
                flattened_content.append(item["text"])
            elif "image_caption" in item:
                flattened_content.append(item["image_caption"])
    return "\n".join(flattened_content)


async def generate_questions_for_article(article: ArticleInput):
    """
    Generate prediction market-style questions for an article using GPT
    and link them to relevant substrings, including relevant existing questions.
    """
    # Flatten article content
    flattened_content = flatten_article_content(article.content)
    try:
        # Step 1: Generate new questions

        article_content_list = []
        for i, item in enumerate(article.content):
            if isinstance(item.root, TextContent):
                article_content_list.append({"index": i, "text": item.root.text})
            if isinstance(item.root, ImageContent):
                article_content_list.append(
                    {"index": i, "image_caption": item.root.image_caption}
                )

        article_date = str(article.published_date)
        print(f"Generating questions for article published on {article_date}...")
        prompt_generate = f"""
        The article content is as follows:
        {article_content_list}

        The current date is: {article_date}
        
        Generate 2-4 high-quality prediction market-style questions relevant to this article. Questions must be answerable as a YES or NO. Questions should be specific (and NOT ambiguous) and tied to the article's content and about events that will have a result known in the future after the current date: {article_date}. Questions should be predictions and not about events prior to article date: {article_date}.
        
        Aim for a mixture of questions that will resolve in the near future as well as later on and a mixture of more general and more specific questions but with no ambiguity.
        
        Output the questions in JSON format:
        [
            {{
                "question": "Will X event happen by Y date?",
                "metadata": {{
                    "tags": ["tag1", "tag2"],
                }},
                "index_in_article": 0 # index of the paragraph that most closely relates to the question. If the question is not tied to a specific paragraph, leave this field as null.
            }}
        ]
        """
        question_generation_response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt_generate},
            ],
            tools=[openai.pydantic_function_tool(GeneratedQuestions)],
        )

        generated_questions = (
            question_generation_response.choices[0]
            .message.tool_calls[0]
            .function.parsed_arguments.questions
        )
        for q in generated_questions:
            q.question_id = str(uuid.uuid4().int)

        for question in generated_questions:
            index = question.index_in_article
            if index is not None and 0 <= index < len(article_content_list):
                question.index_in_article = index
            else:
                question.index_in_article = None

        # Step 3: Check existing questions from the database for relevance
        existing_questions = database.get("questions", [])
        existing_questions = random.sample(
            list(existing_questions.values()), min(250, len(existing_questions))
        )
        relevant_existing_questions = []
        if existing_questions:
            prompt_existing_questions = f"""
            Here is a list of existing questions from the database:
            {json.dumps(existing_questions, indent=2)}

            Based on the following article content:
            {flattened_content}

            Select between 0 and 3 questions that are relevant to this article. Return them in the same JSON format.
            """

            relevance_response = client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt_existing_questions},
                ],
                tools=[openai.pydantic_function_tool(GeneratedQuestions)],
            )
            try:
                relevant_existing_questions = (
                    relevance_response.choices[0]
                    .message.tool_calls[0]
                    .function.parsed_arguments.questions
                )
            except Exception as e:
                print(f"Error parsing relevant existing questions: {str(e)}")
                relevant_existing_questions = []

        # Append relevant existing questions to linked_questions
        for question in relevant_existing_questions:
            question.index_in_article = None  # Add with index_in_article set to None
            generated_questions.append(question)

        return {"questions": generated_questions}

    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        traceback.print_exc()  # Prints the exact traceback of the error
        return {"questions": []}


@router.get("/questions")
async def get_questions():
    """
    Get all questions stored in the database.
    """
    random.seed(200)
    return random.sample(list(database["questions"].values()), 200)


@router.get("/questions/{question_id}")
async def get_questions(question_id: str):
    """
    Get all questions stored in the database.
    """

    for question in database["questions"]:
        if question == question_id:
            return database["questions"][question]

    raise HTTPException(status_code=404, detail="No question found.")


@router.post("/questions/{question_id}/events", response_model=ExtractedEvents)
async def get_events_for_question(question_id: str):
    """
    Extract relevant events for a given question ID from all related articles.
    Each event includes event title, event date (if available), and article ID.
    """
    # Fetch the question by ID
    question = database["questions"].get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Fetch related articles for the question
    related_articles = [
        article
        for article in database["articles"].values()
        if article["id"] in question.get("article_ids", [])
    ]
    if not related_articles:
        raise HTTPException(
            status_code=404, detail="No related articles found for the given question."
        )

    # Prepare content for GPT processing
    article_contents = [
        {
            "article_id": article["id"],
            "content": article["content"],
        }
        for article in related_articles
    ]

    # Define the structured model for the OpenAI API
    class EventExtractionRequest(BaseModel):
        question: str
        articles: List[dict]

    event_extraction_request = EventExtractionRequest(
        question=question["text"], articles=article_contents
    )

    try:
        # Use structured data mode with OpenAI API
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI that extracts events from articles related to specific questions. "
                    "Each event should include an event title, an optional event date, and the article ID from which it was derived.",
                },
                {
                    "role": "user",
                    "content": event_extraction_request.json(),
                },
            ],
            tools=[openai.pydantic_function_tool(ExtractedEvents)],
        )

        # Parse the structured response
        parsed_arguments = (
            completion.choices[0].message.tool_calls[0].function.parsed_arguments
        )
        return parsed_arguments

    except Exception as e:
        # return empty events list
        print(f"Error generating events: {str(e)}")
        return ExtractedEvents(question_id=question_id, events=[])

@lru_cache
@router.post("/get_fake_clusters_for_question", response_model=ClusteredSubtopics)
async def get_clusters_for_question(cluster_request: ClusterRequest):
    """
    Generate clusters of sub-topics for a given question based on related articles.
    Each cluster contains a sub-topic and a list of related articles.
    """
    question_id = cluster_request.question_id
    # Fetch the question by ID
    question = database["questions"].get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    print(question)
    # Fetch related articles for the question
    related_articles = [
        {
            "article_id": article["id"],
            "content": flatten_article_content(article["content"]),
        }
        for article in database["articles"].values()
        if article["id"] in question.get("article_ids", [])
    ]
    if not related_articles:
        raise HTTPException(
            status_code=404, detail="No related articles found for the given question."
        )

    # Define the structured model for the OpenAI API
    class ClusterRequest(BaseModel):
        question: str
        articles: List[dict]

    cluster_request = ClusterRequest(
        question=question["question"], articles=related_articles
    )

    try:
        # Use structured data mode with OpenAI API
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI that clusters sub-topics from articles related to specific questions. "
                    "Each cluster should include a topic title and the IDs of related articles. If there are not many or no other articles come up with plausible and realistic fake clusters and articles. Aim for at least 4 clusters and a MINIMUM of 2-3 articles per cluster.",
                },
                {
                    "role": "user",
                    "content": cluster_request.json(),
                },
            ],
            tools=[openai.pydantic_function_tool(ClusteredSubtopics)],
        )

        # Parse the structured response
        parsed_arguments = (
            completion.choices[0].message.tool_calls[0].function.parsed_arguments
        )
        return parsed_arguments

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating clusters: {str(e)}"
        )
        

@lru_cache
@router.post("/get_clusters_for_question", response_model=ClusteredSubtopics)
async def get_clusters_for_question(cluster_request: ClusterRequest):
    """
    Generate clusters of sub-topics for a given question based on related articles.
    Each cluster contains a sub-topic and a list of related articles.
    """
    question_id = cluster_request.question_id
    # Fetch the question by ID
    question = database["questions"].get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Fetch related articles for the question
    related_articles = [
        {
            "article_id": article["id"],
            "content": flatten_article_content(article["content"]),
        }
        for article in database["articles"].values()
        if article["id"] in question.get("article_ids", [])
    ]
    if not related_articles:
        raise HTTPException(
            status_code=404, detail="No related articles found for the given question."
        )

    # Define the structured model for the OpenAI API
    class ClusterRequest(BaseModel):
        question: str
        articles: List[dict]

    cluster_request = ClusterRequest(
        question=question["text"], articles=related_articles
    )

    try:
        # Use structured data mode with OpenAI API
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI that clusters sub-topics from articles related to specific questions. "
                    "Each cluster should include a topic title and the IDs of related articles.",
                },
                {
                    "role": "user",
                    "content": cluster_request.json(),
                },
            ],
            tools=[openai.pydantic_function_tool(ClusteredSubtopics)],
        )

        # Parse the structured response
        parsed_arguments = (
            completion.choices[0].message.tool_calls[0].function.parsed_arguments
        )
        return parsed_arguments

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating clusters: {str(e)}"
        )


@lru_cache
@router.get("/articles-for-question/{question_id}")
async def get_articles_for_question(question_id: str):
    """
    Get all articles related to a specific question based on the question ID.
    """
    question = database["questions"].get(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")
    article_ids = question.get("article_ids", [])
    articles = []
    for article_id in article_ids:
        article = database["articles"].get(article_id)
        if article:
            articles.append(article)
    return articles


app.include_router(router)
