import requests

m = requests.post(
    "http://localhost:8000/markets", json={"name": "foo", "description": "bar"}
)

print(m.text)

id = m.json()["id"]
print(id)

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"side": "bid", "price": "50", "quantity": 10},
)

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"side": "ask", "price": "51", "quantity": 10},
)

clob = requests.get(
    f"http://localhost:8000/markets/{id}/clob",
)
print(clob.json())

oid = m.json()["id"]

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"side": "ask", "price": "49", "quantity": 10},
)

m = requests.delete(
    f"http://localhost:8000/markets/{id}/order/{oid}",
)

m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"side": "bid", "price": "100", "quantity": 10},
)
m = requests.post(
    f"http://localhost:8000/markets/{id}/order",
    json={"side": "ask", "price": "50", "quantity": 5},
)
