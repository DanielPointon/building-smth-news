from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
    UserTrades,
    Uuid,
)
from db import Db, HasId


def get_by_id(db: Db, id: Uuid):
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/users/{id}/trades")
async def users_get_trades(id: Uuid) -> UserTrades:
    trades: list[MarketTrade] = []

    for c in CLOBS.store.values():
        for t in c.trades:
            if t.buy_user_id == id:
                trades.append(
                    MarketTrade(
                        market_id=c.id,
                        side="bid",
                        time=t.time,
                        price=t.price,
                        quantity=t.quantity,
                    )
                )
            elif t.sell_user_id == id:
                trades.append(
                    MarketTrade(
                        market_id=c.id,
                        side="ask",
                        time=t.time,
                        price=t.price,
                        quantity=t.quantity,
                    )
                )

    trades.sort(key=lambda k: k.time)
    return UserTrades(user_id=id, trades=trades)


markets = FastAPI()
app.mount("/markets", markets, name="markets")


@markets.get("/")
async def get_markets(user_id: str | None = None) -> MarketList:
    markets = MARKETS.store.values()

    if user_id is not None:
        markets = [m for m in markets if user_id in CLOBS[m.id].users]

    return MarketList(markets=list(markets))


@markets.post("/")
async def create_market(info: MarketCreateInfo) -> Market:
    market = (
        Market(id=info.id, name=info.name, description=info.description)
        if info.id
        else Market(name=info.name, description=info.description)
    )
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

    print(clob)

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
        MarketTrade(
            market_id=id, side=None, time=t.time, price=t.price, quantity=t.quantity
        )
        for t in clob.trades
    ]

    trades.sort(key=lambda k: k.time)

    return MarketTrades(market_id=id, midpoint=clob.midpoint(), trades=trades)


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

    midpoint = clob.midpoint()
    return MarketClob(midpoint=midpoint, bids=bids, asks=asks)
