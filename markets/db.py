from typing import Protocol
from models import Uuid


class HasId(Protocol):
    id: Uuid


class Db[V: HasId]:
    store: dict[Uuid, V]

    def __init__(self):
        self.store = {}

    def get(self, key: Uuid) -> V | None:
        return self.store.get(key)

    def insert(self, v: V):
        if v.id in self.store:
            raise KeyError("Exists")

        self.store[v.id] = v
