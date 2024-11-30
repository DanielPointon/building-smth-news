type Uuid = string;

interface User {
  id: Uuid;
  created_at: string; // iso date string
}

interface Market {
  id: Uuid;
  created_at: string;
  name: string;
  description: string;
}

interface MarketCreateInfo {
  name: string;
  description: string;
}

type OrderSide = "bid" | "ask";

interface Order {
  id: Uuid;
  created_at: string;
  user_id: Uuid;
  side: OrderSide;
  price: number;
  quantity: number;
}

interface OrderCreateInfo {
  user_id: Uuid;
  side: OrderSide;
  price: number;
  quantity: number;
}

interface MarketClobOrder {
  price: number;
  quantity: number;
}

interface MarketClob {
  bids: MarketClobOrder[];
  asks: MarketClobOrder[];
}

export class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
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

