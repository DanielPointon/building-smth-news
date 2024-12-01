from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

import uuid

Uuid = str


class Model(BaseModel):
    id: Uuid = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)


class User(Model):
    pass


class Market(Model):
    name: str
    description: str


class MarketCreateInfo(BaseModel):
    id: str | None = None
    name: str
    description: str


type OrderSide = Literal["bid", "ask"]


class OrderCreateInfo(BaseModel):
    user_id: Uuid
    side: OrderSide
    price: int
    quantity: int


class MarketList(BaseModel):
    markets: list[Market]


class MarketTrade(BaseModel):
    market_id: str
    side: OrderSide | None
    time: datetime
    price: int
    quantity: int


class MarketTrades(BaseModel):
    market_id: Uuid
    midpoint: float | None
    trades: list[MarketTrade]


class UserTrades(BaseModel):
    user_id: Uuid
    trades: list[MarketTrade]


class MarketClobOrder(BaseModel):
    price: int
    quantity: int


class MarketClob(BaseModel):
    midpoint: float | None

    bids: list[MarketClobOrder]
    asks: list[MarketClobOrder]


class Order(Model):
    user_id: Uuid
    side: OrderSide
    price: int
    quantity: int
