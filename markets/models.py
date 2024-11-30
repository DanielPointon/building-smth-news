from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

import uuid

type Uuid = str


class Model(BaseModel):
    id: Uuid = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)


class User(Model):
    pass


class Market(Model):
    name: str
    description: str


class MarketCreateInfo(BaseModel):
    name: str
    description: str


type OrderSide = Literal["bid", "ask"]


class OrderCreateInfo(BaseModel):
    user_id: Uuid
    side: OrderSide
    price: int
    quantity: int


class MarketClobOrder(BaseModel):
    price: int
    quantity: int


class MarketClob(BaseModel):
    bids: list[MarketClobOrder]
    asks: list[MarketClobOrder]


class Order(Model):
    user_id: Uuid
    side: OrderSide
    price: int
    quantity: int
