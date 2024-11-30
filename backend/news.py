from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Union
from pydantic import BaseModel, RootModel
import json
from pathlib import Path
from openai import Client
import uuid
from fastapi.responses import JSONResponse
from typing import Optional
import openai

app = FastAPI()
router = APIRouter()

OPENAI_API_KEY = json.loads(open("secrets.json").read())["OPENAI_API_KEY"]

client = Client(api_key=OPENAI_API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB_PATH = Path("database.json")
DB_PATH = Path("database.json")

with open(DB_PATH, "r") as db_file:
    print(db_file)
    database = json.load(db_file)


# print(database)

def save_database():
    def pydantic_to_serializable(obj):
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
    metadata: QuestionMetadata
    link_to_substring: str
    index_in_article: Optional[int] = None
    
class GeneratedQuestions(BaseModel):
    questions: List[QuestionWithLink]
    
class ArticleInput(BaseModel):
    id: Union[int, None]
    title: str
    description: str
    author: str
    published_date: str  # ISO 8601 format (e.g., "2024-11-30")
    content: List[ArticleContent]
    topic: str
    metadata: dict  # Includes fields like countries and other dynamic metadata
    questions: List[QuestionInput]

class Event(BaseModel):
    event_title: Optional[str]
    event_date: Optional[str]  # "YYYY-MM-DD" or None
    article_id: int

class ExtractedEvents(BaseModel):
    question_id: int
    events: List[Event]
    
class Cluster(BaseModel):
    cluster_topic: str
    article_ids: List[int]

class ClusteredSubtopics(BaseModel):
    question_id: int
    clusters: List[Cluster]


@router.post("/articles/create")
async def create_article(article: ArticleInput):
    """
    Create a new article with detailed question data and metadata. If a question already exists
    (based on text and metadata), link the article to the existing question.
    """
    print("Creating article...")
    article.id = uuid.uuid4().int

    # Add the article to the database
    new_article = {
        "id": article.id,
        "title": article.title,
        "description": article.description,
        "author": article.author,
        "published_date": article.published_date,
        "content": [item.root for item in article.content],  # Flatten content
        "topic": article.topic,
        "metadata": article.metadata,
        "question_ids": [],
    }
    database["articles"][article.id] = new_article

    # Process each question in the input
    for question in article.questions:
        # Check if the question already exists
        matching_question = next(
            (q for q in database["questions"].values()
             if q["text"] == question.text and q["metadata"] == question.metadata),
            None
        )

        if matching_question:
            # If the question exists, link the article to the existing question
            if article.id not in matching_question["article_ids"]:
                matching_question["article_ids"].append(article.id)
            new_article["question_ids"].append(matching_question["id"])
        else:
            # If the question doesn't exist, create a new one
            new_question = {
                "id": question.id,
                "text": question.text,
                "metadata": question.metadata,
                "article_ids": [article.id],
            }
            database["questions"][question.id] = new_question
            new_article["question_ids"].append(question.id)

    # Save the database
    save_database()

    return {"article_id": article.id, "message": "Article and associated questions created/linked successfully."}


@router.get("/articles/{article_id}")
async def get_article(article_id: str):
    """
    Article content can be either a string (text) or an image with caption.
    Fetch a specific article by ID from the database.
    """
    article = next(
        (article for article in database["articles"] 
         if str(article["id"]) == article_id),
        None
    )
    
    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )
    
    return article

@router.post("/articles/metadata")
async def get_article_metadata(article_metadata: ArticleMetadataRequest):
    """
    Generate metadata for an article using GPT-4o.
    Metadata includes a list of countries and other dynamic attributes.
    """
    article_id = article_metadata.article_id
    article = database["articles"].get(str(article_id))
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")

    flattened_content = flatten_article_content(article["content"])

    prompt_metadata = f"""
    Analyze the following article content:
    {flattened_content}

    Extract metadata including:
    - "countries": A list of country codes relevant to the article (e.g., ["US", "FR"]). Leave this empty if no countries are mentioned.
    - Other relevant metadata that could be useful for classification (i.e. fields like "tags", "topics", "concepts", "events" etc).

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

    article["metadata"] = json.loads(metadata)
    save_database()

    return {"article_id": article_id, "metadata": metadata}


@router.get("/questions/country/{country_code}", response_model=List[dict])
async def get_questions_by_country(country_code: str):
    """
    Get questions related to a specific country based on the metadata of associated articles.
    """
    related_articles = [article for article in database["articles"].values() if country_code in article["metadata"].get("countries", [])]

    question_ids = {q_id for article in related_articles for q_id in article["question_ids"]}

    questions = [question for question in database["questions"].values() if question["id"] in question_ids]
    return questions


def flatten_article_content(content: List[Union[str, dict]]) -> str:
    """
    Flatten the article content into a single text block for processing with GPT.
    Includes text content and captions for images.
    """
    flattened_content = []
    for item in content:
        if isinstance(item, str):
            flattened_content.append(item)
        elif isinstance(item, dict) and "image_caption" in item:
            flattened_content.append(item["image_caption"])
    return "\n".join(flattened_content)

@router.post("/articles/generate-questions", response_model=GeneratedQuestions)
async def generate_questions_for_article(article: ArticleInput):
    """
    Generate prediction market-style questions for an article using GPT
    and link them to relevant substrings.
    """
    # Flatten article content
    flattened_content = flatten_article_content(article.content)
    if database["articles"].get(article.id) and database["articles"][article.id].get("questions"):
        return {"questions": database["articles"][article.id]["questions"]}
    try:
        # Step 1: Generate questions
        prompt_generate = f"""
        The article content is as follows:
        {flattened_content}

        Generate 5 prediction market-style questions relevant to this article. Questions should be specific and tied to the article's content. Output the questions in JSON format:
        [
            {{
                "question": "Will X event happen by Y date?",
                "metadata": {{
                    "tags": ["tag1", "tag2"],
                    "related_topics": ["topic1", "topic2"]
                }}
            }}
        ]
        If there are no relevant questions, return an empty list.
        """
        question_generation_response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt_generate},
            ],
            tools=[openai.pydantic_function_tool(GeneratedQuestions)],
        )
        print(question_generation_response.choices[0])
        generated_questions = question_generation_response.choices[0].message.tool_calls[0].function.parsed_arguments["questions"]

        # Step 2: Link questions to substrings in the article
        prompt_link = f"""
        The article content is as follows:
        {flattened_content}

        Here is a list of generated questions:
        {json.dumps([q.dict() for q in generated_questions])}

        For each question, identify the most relevant substring in the article. If no substring is relevant, return an empty string. The response format should be:
        [
            {{
                "question": "Will X event happen by Y date?",
                "metadata": {{
                    "tags": ["tag1", "tag2"],
                    "related_topics": ["topic1", "topic2"]
                }},
                "link_to_substring": "exact substring from the article or empty string"
            }}
        ]
        """
        linking_response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt_link},
            ],
            tools=[openai.pydantic_function_tool(GeneratedQuestions)],
        )

        linked_questions = linking_response.choices[0].message.tool_calls[0].function.parsed_arguments["questions"]

        # Add index_in_article for linked substrings
        for question in linked_questions:
            substring = question.link_to_substring
            question.index_in_article = (
                flattened_content.find(substring) if substring else len(flattened_content)
            )
        database["articles"][article.id]["questions"] = linked_questions
        return {"questions": linked_questions}

    except Exception as e:
        return {"questions": []}

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
        article for article in database["articles"].values()
        if article["id"] in question.get("article_ids", [])
    ]
    if not related_articles:
        raise HTTPException(status_code=404, detail="No related articles found for the given question.")

    # Prepare content for GPT processing
    article_contents = [
        {
            "article_id": article["id"],
            "content": flatten_article_content(article["content"]),
        }
        for article in related_articles
    ]

    # Define the structured model for the OpenAI API
    class EventExtractionRequest(BaseModel):
        question: str
        articles: List[dict]

    event_extraction_request = EventExtractionRequest(
        question=question["text"],
        articles=article_contents
    )
    
    if database["questions"][question_id].get("events"):
        return ExtractedEvents(events=database["questions"][question_id]["events"], question_id=question_id)
    
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
        parsed_arguments = completion.choices[0].message.tool_calls[0].function.parsed_arguments
        database["questions"][question_id]["events"] = parsed_arguments.events
        save_database()
        return parsed_arguments

    except Exception as e:
        # return empty events list
        print(f"Error generating events: {str(e)}")
        return ExtractedEvents(question_id=question_id, events=[])

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
        {"article_id": article["id"], "content": flatten_article_content(article["content"])}
        for article in database["articles"].values()
        if article["id"] in question.get("article_ids", [])
    ]
    if not related_articles:
        raise HTTPException(status_code=404, detail="No related articles found for the given question.")

    # Define the structured model for the OpenAI API
    class ClusterRequest(BaseModel):
        question: str
        articles: List[dict]

    cluster_request = ClusterRequest(
        question=question["text"],
        articles=related_articles
    )
    
    if database["questions"][question_id].get("clusters"):
        return ClusteredSubtopics(clusters=database["questions"][question_id]["clusters"])

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
        parsed_arguments = completion.choices[0].message.tool_calls[0].function.parsed_arguments
        database["questions"][question_id]["clusters"] = parsed_arguments.clusters
        return parsed_arguments

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating clusters: {str(e)}")

app.include_router(router)
