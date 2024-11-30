from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import override
from pydantic.dataclasses import dataclass

from models import Order, Uuid


class PriceOrder(Enum):
    ASC = 1
    DESC = -1


@dataclass
class OrderPrice:
    pred: OrderPrice | None
    succ: OrderPrice | None

    price: int
    orders: list[Order]


class OrderPriceList:
    first: OrderPrice | None
    last: OrderPrice | None
    sort: PriceOrder

    def __init__(self, sort: PriceOrder):
        self.first = None
        self.last = None
        self.sort = sort

    def clean_orders(self):
        head = self.first
        while head:
            if not head.orders:
                if head.succ:
                    head.succ.pred = head.pred
                else:
                    self.last = head.pred
                if head.pred:
                    head.pred.succ = head.succ
                else:
                    self.first = head.succ

            head = head.succ

    def get_order_price(self, order: Order) -> OrderPrice:
        head = self.first

        price = order.price * self.sort.value

        while True:
            if not head:
                node = OrderPrice(self.last, None, order.price, [])

                if not self.first:
                    self.first = node

                if self.last:
                    self.last.succ = node

                self.last = node

                return node

            head_price = head.price * self.sort.value
            if head_price > price:
                node = OrderPrice(None, head, order.price, [])

                if head.pred:
                    node.pred = head.pred
                    head.pred.succ = node
                else:
                    self.first = node

                head.pred = node

                return node
            elif head_price == price:
                return head

            head = head.succ


@dataclass
class Trade:
    buy_user_id: str
    sell_user_id: str
    time: datetime
    price: int
    quantity: int


class Clob:
    # market id
    id: Uuid

    users: set[str]

    bids: OrderPriceList
    asks: OrderPriceList

    trades: list[Trade]

    orders: dict[Uuid, OrderPrice]

    def __init__(self, id: Uuid):
        self.id = id
        self.users = set()
        self.bids = OrderPriceList(PriceOrder.DESC)
        self.asks = OrderPriceList(PriceOrder.ASC)
        self.orders = {}
        self.trades = []

    def _add_order(self, order: Order, price_list: OrderPriceList):
        price_node = price_list.get_order_price(order)

        price_node.orders.append(order)

        assert order.id not in self.orders
        self.orders[order.id] = price_node

    @override
    def __repr__(self) -> str:
        s = ""

        ask = self.asks.last
        while ask:
            s += f"{ask.price: >4} : {[o.quantity for o in ask.orders]}\n"
            ask = ask.pred

        s += "-------------\n"

        bid = self.bids.first
        while bid:
            s += f"{bid.price: >4} : {[o.quantity for o in bid.orders]}\n"
            bid = bid.succ

        return s

    def delete_order(self, id: Uuid) -> Order | None:
        node = self.orders.get(id)
        if not node:
            return None

        del self.orders[id]

        idx = [o.id for o in node.orders].index(id)
        order = node.orders.pop(idx)

        self._clean_orders()

        return order

    def insert_order(self, order: Order):
        self.users.add(order.user_id)

        self._process_order(order)

        if order.quantity == 0:
            return

        match order.side:
            case "bid":
                self._add_order(order, self.bids)
            case "ask":
                self._add_order(order, self.asks)

    def on_order_fill(self, order: Order, price: int, fill: int):
        # TODO:
        print(
            f"Order {order.id} ({order.side}): filled {fill} @ {price} (limit={order.price})"
        )

    def _clean_orders(self):
        self.bids.clean_orders()
        self.asks.clean_orders()

    def midpoint(self) -> float | None:
        if self.bids.first and self.asks.first:
            return (self.bids.first.price + self.asks.first.price) / 2

        return None

    def _process_order(self, order: Order):
        match order.side:
            case "bid":
                price_list = self.asks
                price_mul = 1
            case "ask":
                price_list = self.bids
                price_mul = -1

        node = price_list.first

        price = order.price * price_mul

        while node:
            node_price = node.price * price_mul
            if node_price > price:
                break

            counter = node.orders[0]

            size = min(order.quantity, counter.quantity)

            order.quantity -= size
            counter.quantity -= size

            match order.side:
                case "bid":
                    buy_user = order.user_id
                    sell_user = counter.user_id
                case "ask":
                    buy_user = counter.user_id
                    sell_user = order.user_id

            self.trades.append(
                Trade(buy_user, sell_user, datetime.now(), counter.price, size)
            )
            self.on_order_fill(order, counter.price, size)
            self.on_order_fill(counter, counter.price, size)

            if counter.quantity == 0:
                _ = self.delete_order(counter.id)

            if order.quantity == 0:
                return

            node = node.succ

        self._clean_orders()
