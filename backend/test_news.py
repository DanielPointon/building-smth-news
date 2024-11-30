import requests
import json

# Base URL of the FastAPI application
BASE_URL = "http://127.0.0.1:8000"  # Update this if your app runs on a different address

def test_create_article():
    print("Testing /articles/create...")
    payload = {
        "id": "1",
        "title": "Test Article",
        "description": "A test article for verification.",
        "author": "John Doe",
        "published_date": "2024-11-30",
        "content": [
            {"text": "This is a simple text content."},  # TextContent example
            {
                "image_url": "http://example.com/image.jpg",
                "image_caption": "An illustrative image caption."
            }  # ImageContent example
        ],
        "topic": "Technology",
        "metadata": {"tags": ["AI", "Technology"], "countries": ["US"]},
        "questions": [
            {
                "id": "101",
                "text": "Will AI surpass human intelligence by 2030?",
                "metadata": {"tags": ["AI", "Prediction"]}
            }
        ]
    }

    response = requests.post(f"{BASE_URL}/articles/create", json=payload)
    print(response.json())
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    assert response.json()["message"] == "Article and associated questions created/linked successfully."
    print("Passed.")

def test_get_article_metadata():
    print("Testing /articles/metadata...")
    payload = {"article_id": "39772345963899444759394251382399135389"}  # Form data must be sent as strings

    response = requests.post(f"{BASE_URL}/articles/metadata", json=payload)
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    metadata = response.json()
    assert "article_id" in metadata, "Response missing 'article_id'."
    assert "metadata" in metadata, "Response missing 'metadata'."
    print("Passed.")

def test_get_questions_by_country():
    print("Testing /questions/country/{country_code}...")
    country_code = "US"
    response = requests.get(f"{BASE_URL}/questions/country/{country_code}")
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    questions = response.json()
    print(questions)
    assert isinstance(questions, list), "Questions should be a list."
    assert len(questions) > 0, "Expected at least one question."
    print("Passed.")

def test_get_events_for_question():
    print("Testing /questions/{question_id}/events...")
    question_id = 101
    response = requests.post(f"{BASE_URL}/questions/{question_id}/events", data={})
    print(response.json())
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    events = response.json()
    assert "question_id" in events, "Response missing 'question_id'."
    assert "events" in events, "Response missing 'events'."
    assert isinstance(events["events"], list), "'events' should be a list."
    print("Passed.")

def test_get_clusters_for_question():
    print("Testing /get_clusters_for_question...")
    payload = {"question_id": "101"}  # Form data must be sent as strings

    response = requests.post(f"{BASE_URL}/get_clusters_for_question", json=payload)
    print(response.json())
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    clusters = response.json()
    
    assert "question_id" in clusters, "Response missing 'question_id'."
    assert "clusters" in clusters, "Response missing 'clusters'."
    assert isinstance(clusters["clusters"], list), "'clusters' should be a list."
    print(clusters)
    print("Passed.")
    
def test_generate_questions_for_article():
    print("Testing generate_questions_for_article...")
    
    # Create a mock article
    article_payload = {
        "id": "2",
        "title": "Sample Article for Question Generation",
        "description": "A mock article to test question generation.",
        "author": "Jane Doe",
        "published_date": "2024-11-30",
        "content": [
            {"text": "This article discusses advancements in AI and its impact on technology."},
            {
                    "image_url": "http://example.com/sample_image.jpg",
                    "image_caption": "A conceptual illustration of AI."
            }
        ],
        "topic": "Artificial Intelligence",
        "metadata": {"tags": ["AI", "Technology"], "countries": ["US"]},
        "questions": []
    }

    # Step 2: Call generate_questions_for_article endpoint
    response = requests.post(f"{BASE_URL}/articles/generate-questions", json=article_payload)
    assert response.status_code == 200, f"Failed to generate questions: {response.text}"

    questions = response.json()
    assert isinstance(questions, dict), "Response should be a dictionary."
    assert "questions" in questions, "Response missing 'questions'."

    print(f"Generated questions: {questions}")
    print("Passed.")

if __name__ == "__main__":
    print("Starting tests...")
    try:
        test_create_article()
        test_get_article_metadata()
        test_get_questions_by_country()
        test_get_events_for_question()
        test_get_clusters_for_question()
        test_generate_questions_for_article()
        print("All tests passed!")
    except AssertionError as e:
        print(f"Test failed: {e}")
