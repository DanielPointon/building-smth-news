
import uuid
import json

    

import requests
import json

# Base URL of the FastAPI application
BASE_URL = "http://127.0.0.1:8000"  # Update if your app runs on a different address

news_articles = json.loads(open("../scraper/out/older_articles_nodup.json").read())

news_articles = news_articles[170:]  # Limit the number of articles for testing

def generate_metadata(article):
    print(f"Generating metadata for article: {article['title']}...")
    response = requests.post(f"{BASE_URL}/articles/metadata", json=article)

    if response.status_code == 200:
        metadata = response.json()
        print(f"Metadata generated: {metadata}")
        return metadata
    else:
        print(f"Failed to generate metadata for article {article['id']}: {response.text}")
        return None

def generate_questions(article):
    print(f"Generating questions for article: {article['title']}...")
    response = requests.post(f"{BASE_URL}/articles/generate-questions", json=article)
    if response.status_code == 200:
        questions = response.json()
        print(f"Questions generated: {questions}")
        return questions["questions"]
    else:
        print(f"Failed to generate questions for article {article['id']}: {response.text}")
        return []

def generate_clusters(question_id):
    print(f"Generating clusters for question ID: {question_id}...")
    payload = {"question_id": question_id}
    response = requests.post(f"{BASE_URL}/get_clusters_for_question", json=payload)
    if response.status_code == 200:
        clusters = response.json()
        print(f"Clusters generated: {clusters}")
        return clusters
    else:
        print(f"Failed to generate clusters for question {question_id}: {response.text}")
        return []

def generate_events(question_id):
    print(f"Generating events for question ID: {question_id}...")
    response = requests.post(f"{BASE_URL}/questions/{question_id}/events", data={})
    if response.status_code == 200:
        events = response.json()
        print(f"Events generated: {events}")
        return events
    else:
        print(f"Failed to generate events for question {question_id}: {response.text}")
        return []
    
def create_article(article):
    new_article = requests.post(f"{BASE_URL}/articles/create", json=article)
    if new_article.status_code == 200:
        print(f"Article created: {new_article.json()}")
        print(new_article.json())
    else:
        print(f"Failed to create article: {new_article.text}")
        return None

def clean_article(article):
    # go through content and if any items have "description" rename it to "image_caption", remove "type" field and change "content" to "text"
    for content in article["content"]:
        if "description" in content:
            content["image_caption"] = content["description"]
            del content["description"]
        if "type" in content:
            del content["type"]
        if "content" in content:
            content["text"] = content["content"]
            del content["content"]
    article["metadata"] = {}
    article["questions"] = []
            
            
def process_articles(articles):
    all_results = []
    for article in articles:
        if 'title' not in article:
            print("Skipping article without title...")
            continue
        print(f"Processing article: {article['title']}...")
        
        article['id'] = str(uuid.uuid4().int)
        
        clean_article(article)

        article = create_article(article)

    return all_results

def process_questions():
    # get all questions first
    response = requests.get(f"{BASE_URL}/questions")
    questions = response.json()
    for question in questions:
        question_id = question["id"]
        # Generate Clusters
        clusters = generate_clusters(question_id)

        # Generate Events
        events = generate_events(question_id)
        

if __name__ == "__main__":
    print("Starting ingestion...")
    results = process_articles(news_articles)

    # Save results to a JSON file for future use
    with open("ingested_articles.json", "w") as outfile:
        json.dump(results, outfile, indent=4)

    print("Ingestion complete. Results saved to 'ingested_articles.json'.")
    