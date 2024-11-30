import requests

uid = "root"

m = requests.post(
    "http://localhost:8000/markets", json={"name": "foo", "description": "bar"}
)

print(m.text)

id = m.json()["id"]
print(id)

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"user_id": uid, "side": "bid", "price": 30, "quantity": 10},
)

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"user_id": uid, "side": "ask", "price": 39, "quantity": 10},
)

clob = requests.get(
    f"http://localhost:8000/markets/{id}/clob",
)
print("CLOB")
print(clob.json())

oid = m.json()["id"]

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"user_id": uid, "side": "ask", "price": 29, "quantity": 10},
)

m = requests.delete(
    f"http://localhost:8000/markets/{id}/order/{oid}",
)

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"user_id": uid, "side": "bid", "price": 70, "quantity": 10},
)
m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"user_id": uid, "side": "ask", "price": 60, "quantity": 5},
)

ms = requests.get(
    f"http://localhost:8000/markets/{id}/clob",
)
print(ms.json())

sides = ["bid", "ask"]

import random

for i in range(200):
    s = random.choice(sides)
    p = random.randint(20, 80)
    q = random.randint(5, 50)
    print({"user_id": uid, "side": s, "price": p, "quantity": q})

    m = requests.post(
        f"http://localhost:8000/markets/{id}/order",
        json={"user_id": uid, "side": s, "price": p, "quantity": q},
    )
