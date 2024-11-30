from __future__ import annotations

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


class Clob:
    # market id
    id: Uuid

    bids: OrderPriceList
    asks: OrderPriceList

    last_traded_price: int | None

    orders: dict[Uuid, OrderPrice]

    def __init__(self, id: Uuid):
        self.id = id
        self.last_traded_price = None
        self.bids = OrderPriceList(PriceOrder.DESC)
        self.asks = OrderPriceList(PriceOrder.ASC)
        self.orders = {}

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
            s += f"{ask.price} : {[o.quantity for o in ask.orders]}\n"
            ask = ask.pred

        s += "------\n"

        bid = self.bids.first
        while bid:
            s += f"{bid.price} : {[o.quantity for o in bid.orders]}\n"
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
        match order.side:
            case "bid":
                self._add_order(order, self.bids)
            case "ask":
                self._add_order(order, self.asks)

        self._process_orders()

    def on_order_fill(self, order: Order, fill: int):
        # TODO:
        print(f"Order {order.id} ({order.side}): filled {fill}")

    def _clean_orders(self):
        self.bids.clean_orders()
        self.asks.clean_orders()

    def _process_orders(self):
        bb = self.bids.first
        ba = self.asks.first

        while bb and ba:
            if bb.price < ba.price:
                break

            if not bb.orders:
                bb = bb.succ
                continue

            if not ba.orders:
                ba = ba.succ
                continue

            cur_bid = bb.orders[0]
            cur_ask = ba.orders[0]

            size = min(cur_bid.quantity, cur_ask.quantity)

            cur_bid.quantity -= size
            cur_ask.quantity -= size

            self.on_order_fill(cur_bid, size)
            self.on_order_fill(cur_ask, size)

            # remove order if empty
            if cur_bid.quantity == 0:
                _ = self.delete_order(cur_bid.id)
            if cur_ask.quantity == 0:
                _ = self.delete_order(cur_ask.id)

        self._clean_orders()
