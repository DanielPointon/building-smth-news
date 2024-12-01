import json
import math
import random
import requests

f = json.load(open("database.json"))


def make_trade(id, p, q):
    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": "root", "side": "bid", "price": p, "quantity": q},
    )

    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": "root", "side": "ask", "price": p - 1, "quantity": q},
    )


n = len(f["questions"])


def process_question(i, a, n):
    print(f"{i}/{n}\r", flush=True)
    id = str(a["id"])
    requests.post(
        "http://localhost:8000/markets",
        json={"id": str(a["id"]), "name": a["question"], "description": ""},
    )

    s = 50
    for _ in range(5):
        r = random.random() + 0.5
        # r = math.log(r) + 0.05
        s = max(0, min(100, int(s * r)))
        make_trade(id, s, 1)


from concurrent.futures import ThreadPoolExecutor, as_completed

n = len(f["questions"])
with ThreadPoolExecutor() as executor:
    futures = [
        executor.submit(process_question, i, a, n)
        for i, a in enumerate(f["questions"].values())
    ]
    for future in as_completed(futures):
        future.result()
