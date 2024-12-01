import json
import requests

f = json.load(open("database.json"))

for a in f["questions"].values():
    print(a["id"])
    m = requests.post(
        "http://localhost:8000/markets",
        json={"id": str(a["id"]), "name": a["question"], "description": ""},
    )
