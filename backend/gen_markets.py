import json
import requests

f = json.load(open("database.json"))

for a in f["questions"].values():
    id = str(a["id"])
    m = requests.post(
        "http://localhost:8000/markets",
        json={"id": str(a["id"]), "name": a["question"], "description": ""},
    )

    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": "root", "side": "bid", "price": 51, "quantity": 1},
    )
    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": "root", "side": "ask", "price": 49, "quantity": 1},
    )
    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": "root", "side": "bid", "price": 49, "quantity": 1},
    )
    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": "root", "side": "ask", "price": 51, "quantity": 1},
    )
