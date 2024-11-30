from fastapi import FastAPI, APIRouter, HTTPException
from typing import List, Union
from pydantic import BaseModel, RootModel
import json
from pathlib import Path
from openai import Client
import uuid

app = FastAPI()
router = APIRouter()

OPENAI_API_KEY = json.loads(open("secrets.json").read())["OPENAI_API_KEY"]

client = Client(api_key=OPENAI_API_KEY)


DB_PATH = Path("database.json")

if DB_PATH.exists():
    with open(DB_PATH, "r") as db_file:
        database = json.load(db_file)
else:
    database = {"articles": [], "questions": []}


def save_database():
    with open(DB_PATH, "w") as db_file:
        json.dump(database, db_file, indent=4)


class ImageContent(BaseModel):
    image_url: str
    image_caption: str


class ArticleContent(RootModel[Union[str, ImageContent]]):
    """
    Article content can be either a string (text) or an image with caption.
    """
    pass


class QuestionInput(BaseModel):
    id: int
    text: str
    metadata: dict

class ArticleInput(BaseModel):
    id: int
    title: str
    description: str
    author: str
    published_date: str  # ISO 8601 format (e.g., "2024-11-30")
    content: List[ArticleContent]
    topic: str
    metadata: dict  # Includes fields like countries and other dynamic metadata
    questions: List[QuestionInput]


@router.post("/articles/create")
async def create_article(article: ArticleInput):
    """
    Create a new article with detailed question data and metadata. If a question already exists
    (based on text and metadata), link the article to the existing question.
    """
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
    database["articles"].append(new_article)

    # Process each question in the input
    for question in article.questions:
        # Check if the question already exists
        matching_question = next(
            (q for q in database["questions"]
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
            database["questions"].append(new_question)
            new_article["question_ids"].append(question.id)

    # Save the database
    save_database()

    return {"message": "Article and associated questions created/linked successfully."}


@router.post("/articles/metadata")
async def get_article_metadata(article_id: int):
    """
    Generate metadata for an article using GPT-4o.
    Metadata includes a list of countries and other dynamic attributes.
    """
    article = next((article for article in database["articles"] if article["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")

    flattened_content = flatten_article_content(article["content"])

    prompt_metadata = f"""
    Analyze the following article content:
    {flattened_content}

    Extract metadata including:
    - "countries": A list of country codes relevant to the article (e.g., ["US", "FR"]).
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

    article["metadata"] = metadata
    save_database()

    return {"article_id": article_id, "metadata": metadata}


@router.get("/questions/country/{country_code}", response_model=List[dict])
async def get_questions_by_country(country_code: str):
    """
    Get questions related to a specific country based on the metadata of associated articles.
    """
    related_articles = [article for article in database["articles"] if country_code in article["metadata"].get("countries", [])]

    question_ids = {q_id for article in related_articles for q_id in article["question_ids"]}

    questions = [question for question in database["questions"] if question["id"] in question_ids]
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


# GPT Integration: Generate and link questions
async def generate_questions_for_article(article: dict):
    """
    Generate prediction market-style questions for an article using GPT
    and link them to relevant substrings.
    """
    # Flatten article content
    flattened_content = flatten_article_content(article["content"])

    # Step 2: Generate questions
    prompt_generate = f"""
    The article content is as follows:
    {flattened_content}

    Generate 5 prediction market-style questions relevant to this article. Questions should be specific, actionable, and tied to the article's content. Output the questions in JSON format:
    [
        {{
            "question": "Will X event happen by Y date?",
            "metadata": {{
                "tags": ["tag1", "tag2"],
                "related_topics": ["topic1", "topic2"]
            }}
        }}
    ]
    """
    response_generate = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt_generate}],
        response_format={"type": "json_object"},
        max_tokens=500,
        temperature=0.7,
    )
    generated_questions = response_generate.choices[0].message.content

    prompt_link = f""" 
    The article content is as follows:
    {flattened_content}

    Here is a list of generated questions:
    {json.dumps(generated_questions)}

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
    response_link = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt_link}],
        response_format={"type": "json_object"},
        max_tokens=500,
        temperature=0.7,
    )
    linked_questions = response_link.choices[0].message.content

    for question in linked_questions:
        substring = question["link_to_substring"]
        question["index_in_article"] = (
            flattened_content.find(substring) if substring else len(flattened_content)
        )
    return linked_questions

@router.post("/questions/{question_id}/events")
async def get_events_for_question(question_id: int):
    """
    Extract relevant events for a given question ID from all related articles.
    Each event includes event title, event date (if available), and article ID.
    """
    # Fetch the question by ID
    question = next((q for q in database["questions"] if q["id"] == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Fetch related articles for the question
    related_articles = [
        article for article in database["articles"]
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

    # Build GPT prompt
    prompt_events = f"""
    The following are contents of articles related to a specific prediction market question:
    
    Question: {question["text"]}

    Articles:
    {json.dumps(article_contents, indent=2)}

    Based on these articles, extract a list of relevant events specific to the question. 
    Each event should include:
    - "event_title": The title of the event.
    - "event_date": The date of the event, if available. Leave blank if not mentioned. Do NOT make this up.
    - "article_id": The ID of the article from which the event is derived. If there are multiple articles with the same event, choose the one with the most relevant context.

    Output the result as a JSON array:
    [
        {{
            "event_title": "Event title goes here",
            "event_date": "YYYY-MM-DD or blank if no date",
            "article_id": 123
        }}
    ]
    """
    try:
        response_events = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt_events}],
            response_format={"type": "json_object"},
            max_tokens=1000,
            temperature=0.7,
        )
        events = response_events.choices[0].message.content

        # Ensure the response is JSON-parseable
        parsed_events = json.loads(events)
        return {"question_id": question_id, "events": parsed_events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting events: {str(e)}")

@router.post("/get_clusters_for_question")
async def get_clusters_for_question(question_id: int):
    """
    Generate clusters of sub-topics for a given question based on related articles.
    Each cluster contains a sub-topic and a list of related articles.
    """
    # Fetch the question by ID
    question = next((q for q in database["questions"] if q["id"] == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Fetch related articles for the question
    related_articles = [
        {"article_id": article["id"], "content": flatten_article_content(article["content"])}
        for article in database["articles"]
        if article["id"] in question.get("article_ids", [])
    ]
    if not related_articles:
        raise HTTPException(status_code=404, detail="No related articles found for the given question.")

    # Build GPT prompt
    prompt_clusters = f"""a
    The following are contents of articles related to a specific prediction market question:
    
    Question: {question["text"]}

    Articles:
    {json.dumps(related_articles, indent=2)}

    Based on these articles, generate clusters of sub-topics relevant to the question. 
    Each cluster should have:
    - "cluster_topic": A short title for the sub-topic.
    - "article_ids": A list of article IDs related to this sub-topic.

    Output the result as a JSON array:
    [
        {{
            "cluster_topic": "Sub-topic title",
            "article_ids": [123, 456]
        }}
    ]
    """
    try:
        # Call GPT-4o API
        response_clusters = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt_clusters}],
            response_format={"type": "json_object"},
            max_tokens=1000,
            temperature=0.7,
        )
        clusters = response_clusters.choices[0].message.content

        # Parse the response to ensure valid JSON
        parsed_clusters = json.loads(clusters)
        return {"question_id": question_id, "clusters": parsed_clusters}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating clusters: {str(e)}")

app.include_router(router)
