from fastapi import FastAPI, HTTPException

from clob import Clob
from models import (
    Market,
    MarketClob,
    MarketClobOrder,
    MarketCreateInfo,
    MarketList,
    MarketTrade,
    MarketTrades,
    Order,
    OrderCreateInfo,
    User,
    Uuid,
)
from db import Db, HasId


def get_by_id[T: HasId](db: Db[T], id: Uuid) -> T:
    v = db.get(id)

    if not v:
        raise HTTPException(status_code=404)

    return v


USERS: Db[User] = Db()
MARKETS: Db[Market] = Db()
CLOBS: Db[Clob] = Db()

debug = True

app = FastAPI(
    debug=debug,
)


@app.get("/users/{id}")
async def get_user(id: Uuid) -> User:
    return get_by_id(USERS, id)


# @app.get("/users/{id}")
# async def get_user_orders(id: Uuid) -> User:
#     return get_by_id(USERS, id)


@app.post("/users")
async def create_user() -> User:
    user = User()

    USERS.insert(user)

    return user


markets = FastAPI()
app.mount("/markets", markets, name="markets")


@markets.get("/")
async def get_markets() -> MarketList:
    return MarketList(markets=list(MARKETS.store.values()))


@markets.post("/")
async def create_market(info: MarketCreateInfo) -> Market:
    market = Market(name=info.name, description=info.description)
    clob = Clob(id=market.id)

    MARKETS.insert(market)
    CLOBS.insert(clob)

    return market


@markets.get("/{id}")
async def markets_get(id: Uuid) -> Market:
    return get_by_id(MARKETS, id)


@markets.post("/{id}/order")
async def markets_create_order(id: Uuid, info: OrderCreateInfo) -> Order:
    clob = get_by_id(CLOBS, id)

    order = Order(
        user_id=info.user_id, side=info.side, price=info.price, quantity=info.quantity
    )
    clob.insert_order(order)

    return order


@markets.delete("/{id}/order/{order_id}")
async def markets_delete_order(id: Uuid, order_id: Uuid) -> Order | None:
    clob = get_by_id(CLOBS, id)

    order = clob.delete_order(order_id)
    if not order:
        raise HTTPException(status_code=404)

    return order


@markets.get("/{id}/trades")
async def markets_get_trades(id: Uuid) -> MarketTrades:
    clob = get_by_id(CLOBS, id)

    trades = [
        MarketTrade(time=t.time, price=t.price, quantity=t.quantity)
        for t in clob.trades
    ]

    return MarketTrades(market_id=id, trades=trades)


@markets.get("/{id}/clob")
async def markets_get_clob(id: Uuid) -> MarketClob:
    clob = get_by_id(CLOBS, id)

    bids: list[MarketClobOrder] = []
    bid = clob.bids.first
    while bid:
        bids.append(
            MarketClobOrder(
                price=bid.price, quantity=sum(o.quantity for o in bid.orders)
            )
        )

        bid = bid.succ

    asks: list[MarketClobOrder] = []
    ask = clob.asks.first
    while ask:
        asks.append(
            MarketClobOrder(
                price=ask.price, quantity=sum(o.quantity for o in ask.orders)
            )
        )

        ask = ask.succ

    midpoint = None
    if bids and asks:
        midpoint = (bids[0].price + asks[0].price) / 2

    return MarketClob(midpoint=midpoint, bids=bids, asks=asks)
