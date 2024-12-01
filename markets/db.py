from typing import Protocol
from models import Uuid


class HasId(Protocol):
    id: Uuid


class Db:
    store: dict

    def __init__(self):
        self.store = {}

    def get(self, key: Uuid):
        return self.store.get(key)

    def __getitem__(self, key: Uuid):
        return self.store[key]

    def insert(self, v):
        if v.id in self.store:
            raise KeyError("Exists")

        self.store[v.id] = v
