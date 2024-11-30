export type Uuid = string;

export interface Model {
  id: Uuid;
  created_at: string; // ISO date string
}

export interface User extends Model {}

export interface Market extends Model {
  name: string;
  description: string;
}

export interface MarketCreateInfo {
  name: string;
  description: string;
}

export type OrderSide = "bid" | "ask";

export interface OrderCreateInfo {
  user_id: Uuid;
  side: OrderSide;
  price: number;
  quantity: number;
}

export interface MarketList {
  markets: Market[];
}

export interface MarketTrade {
  market_id: string
  side: OrderSide
  time: string; // ISO date string
  price: number;
  quantity: number;
}

export interface MarketTrades {
  market_id: Uuid;
  midpoint: number | null;
  trades: MarketTrade[];
}

export interface UserTrades {
  user_id: Uuid;
  trades: MarketTrade[];
}

export interface MarketClobOrder {
  price: number;
  quantity: number;
}

export interface MarketClob {
  midpoint: number | null;
  bids: MarketClobOrder[];
  asks: MarketClobOrder[];
}

export interface Order extends Model {
  user_id: Uuid;
  side: OrderSide;
  price: number;
  quantity: number;
}

export class MarketsClient {
  private readonly baseURL: string;

  constructor() {
    // FIXME: env
    this.baseURL = "http://localhost:8000";
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "DELETE",
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      try {
        console.log(await response.json())
      } catch {}

      throw new Error(
        `HTTP error ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  // users
  async createUser(): Promise<User> {
    return this.request<User>("/users", "POST");
  }

  async getUser(userId: Uuid): Promise<User> {
    return this.request<User>(`/users/${userId}`, "GET");
  }

  // markets
  async createMarket(info: MarketCreateInfo): Promise<Market> {
    return this.request<Market>("/markets/", "POST", info);
  }

  async getMarkets(userId: string | null = null): Promise<MarketList> {
    if (userId != null) {
      return this.request<MarketList>("/markets", "GET");
    } else {
      return this.request<MarketList>(`/markets?userId=${userId}`, "GET");
    }
  }

  async getTrades(marketId: Uuid): Promise<MarketTrades> {
    return this.request<MarketTrades>(`/markets/${marketId}/trades`, "GET");
  }

  async getUserTrades(userId: Uuid): Promise<UserTrades> {
    return this.request<UserTrades>(`/users/${userId}/trades`, "GET");
  }

  async getMarket(marketId: Uuid): Promise<Market> {
    return this.request<Market>(`/markets/${marketId}`, "GET");
  }

  // orders
  async createOrder(
    marketId: Uuid,
    info: OrderCreateInfo
  ): Promise<Order> {
    return this.request<Order>(
      `/markets/${marketId}/order`,
      "POST",
      info
    );
  }

  async deleteOrder(marketId: Uuid, orderId: Uuid): Promise<Order | null> {
    return this.request<Order | null>(
      `/markets/${marketId}/order/${orderId}`,
      "DELETE"
    );
  }

  // clob
  async getMarketClob(marketId: Uuid): Promise<MarketClob> {
    return this.request<MarketClob>(`/markets/${marketId}/clob`, "GET");
  }
}

