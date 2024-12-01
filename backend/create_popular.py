from pydantic import BaseModel
from typing import List, Dict
from openai import Client
import json

OPENAI_API_KEY = json.loads(open("secrets.json").read())["OPENAI_API_KEY"]

client = Client(api_key=OPENAI_API_KEY)

# Define the model for the question input
class Question(BaseModel):
    id: str
    question: str
    metadata: Dict[str, List[str]]
    article_ids: List[int]

# Define the model for the popular questions
class PopularQuestions(BaseModel):
    popular_questions: Dict[str, Question]

# Function to process the input JSON and filter popular questions
def process_questions(questions: Dict[str, dict]) -> Dict[str, dict]:
    # Prepare the questions for GPT processing
    question_list = [
        Question(
            id=q_data['id'],
            question=q_data["question"],
            metadata=q_data["metadata"],
            article_ids=q_data["article_ids"],
        )
        for q_data in questions
    ]

    # Convert the questions to a JSON string for processing
    input_payload = {
        "questions": [q.dict() for q in question_list],
    }

    # Use the OpenAI API for structured data processing
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI that processes JSON data to identify the top 30–40 questions suitable for prediction markets. "
                "Focus on diversity, specificity, and prediction market relevance."
            },
            {
                "role": "user",
                "content": f"Here is the JSON data:\n\n{input_payload}"
            },
        ],
    )

    # Parse the response
    parsed_arguments = (
            completion.choices[0].message.tool_calls[0].function.parsed_arguments
        )
    return parsed_arguments



# Example usage
import random
input_questions = random.sample(list((json.loads(open("database.json").read())['questions']).values()), 1000)
result = process_questions(input_questions)
