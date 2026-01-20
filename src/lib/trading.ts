import { CandlestickData, Time } from "lightweight-charts";
import type { LanguageKey } from "@/contexts/LanguageContext";

export type PaperOrderSide = "BUY" | "SELL";
export type PaperOrderType = "MARKET" | "LIMIT" | "STOP_LIMIT";
export type PaperOrderStatus = "PENDING" | "ACTIVE" | "EXECUTED" | "CANCELLED";

export interface PaperOrder {
  id: string;
  challengeId: number;
  symbol: string;
  side: PaperOrderSide;
  type: PaperOrderType;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  status: PaperOrderStatus;
  createdAt: string;
  executedAt?: string;
  executedPrice?: number;
}

export interface PaperPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface PaperTradingState {
  balance: number;
  orders: PaperOrder[];
  positions: PaperPosition[];
}

const STORAGE_KEY_PREFIX = "ts_paper_trading_v1";

function getStorageKey(userKey: string, challengeId: number) {
  return `${STORAGE_KEY_PREFIX}::${userKey || "guest"}::${challengeId}`;
}

function safeParseState(value: string | null): PaperTradingState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as PaperTradingState;
    if (
      typeof parsed === "object" &&
      parsed &&
      typeof parsed.balance === "number" &&
      Array.isArray(parsed.orders) &&
      Array.isArray(parsed.positions)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadPaperTradingState(
  userKey: string,
  challengeId: number,
  initialBalance: number
): PaperTradingState {
  if (typeof window === "undefined") {
    return { balance: initialBalance, orders: [], positions: [] };
  }
  const key = getStorageKey(userKey, challengeId);
  const existing = safeParseState(window.localStorage.getItem(key));
  if (existing) {
    return existing;
  }
  const state: PaperTradingState = {
    balance: initialBalance,
    orders: [],
    positions: [],
  };
  window.localStorage.setItem(key, JSON.stringify(state));
  return state;
}

export function savePaperTradingState(
  userKey: string,
  challengeId: number,
  state: PaperTradingState
) {
  if (typeof window === "undefined") return;
  const key = getStorageKey(userKey, challengeId);
  window.localStorage.setItem(key, JSON.stringify(state));
}

function createOrderId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function applyExecution(
  state: PaperTradingState,
  order: PaperOrder,
  price: number
): PaperTradingState {
  const cost = order.quantity * price;
  const now = new Date().toISOString();

  if (order.side === "BUY") {
    if (state.balance < cost) {
      return state;
    }
    const nextBalance = state.balance - cost;
    const positions = state.positions.slice();
    const index = positions.findIndex((p) => p.symbol === order.symbol);
    if (index >= 0) {
      const existing = positions[index];
      const newQty = existing.quantity + order.quantity;
      const newAvg =
        (existing.avgPrice * existing.quantity + price * order.quantity) / newQty;
      positions[index] = {
        symbol: existing.symbol,
        quantity: newQty,
        avgPrice: newAvg,
      };
    } else {
      positions.push({
        symbol: order.symbol,
        quantity: order.quantity,
        avgPrice: price,
      });
    }
    const orders = state.orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            status: "EXECUTED",
            executedAt: now,
            executedPrice: price,
          }
        : o
    );
    return {
      balance: nextBalance,
      orders,
      positions,
    };
  }

  const positions = state.positions.slice();
  const index = positions.findIndex((p) => p.symbol === order.symbol);
  if (index < 0) {
    return state;
  }
  const existing = positions[index];
  if (existing.quantity < order.quantity) {
    return state;
  }
  const nextQty = existing.quantity - order.quantity;
  if (nextQty === 0) {
    positions.splice(index, 1);
  } else {
    positions[index] = {
      symbol: existing.symbol,
      quantity: nextQty,
      avgPrice: existing.avgPrice,
    };
  }
  const nextBalance = state.balance + cost;
  const orders = state.orders.map((o) =>
    o.id === order.id
      ? {
          ...o,
          status: "EXECUTED",
          executedAt: now,
          executedPrice: price,
        }
      : o
  );
  return {
    balance: nextBalance,
    orders,
    positions,
  };
}

export function createPaperOrder(
  state: PaperTradingState,
  params: {
    challengeId: number;
    symbol: string;
    side: PaperOrderSide;
    type: PaperOrderType;
    quantity: number;
    limitPrice?: number;
    stopPrice?: number;
  }
): PaperTradingState {
  const order: PaperOrder = {
    id: createOrderId(),
    challengeId: params.challengeId,
    symbol: params.symbol,
    side: params.side,
    type: params.type,
    quantity: params.quantity,
    limitPrice: params.limitPrice,
    stopPrice: params.stopPrice,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    orders: [order, ...state.orders],
  };
}

export function processPaperOrdersWithPrice(
  state: PaperTradingState,
  symbol: string,
  price: number
): { state: PaperTradingState; executed: PaperOrder[] } {
  let nextState = state;
  const executed: PaperOrder[] = [];

  for (const order of state.orders) {
    if (order.symbol !== symbol) continue;
    if (order.status === "EXECUTED" || order.status === "CANCELLED") continue;

    if (order.type === "MARKET" && order.status === "PENDING") {
      const after = applyExecution(nextState, order, price);
      if (after !== nextState) {
        const updatedOrder = after.orders.find((o) => o.id === order.id);
        if (updatedOrder && updatedOrder.status === "EXECUTED") {
          executed.push(updatedOrder);
        }
        nextState = after;
      }
      continue;
    }

    if (order.type === "LIMIT") {
      if (order.limitPrice == null) continue;
      if (order.side === "BUY") {
        if (price <= order.limitPrice) {
          const after = applyExecution(nextState, order, price);
          if (after !== nextState) {
            const updatedOrder = after.orders.find((o) => o.id === order.id);
            if (updatedOrder && updatedOrder.status === "EXECUTED") {
              executed.push(updatedOrder);
            }
            nextState = after;
          }
        }
      } else {
        if (price >= order.limitPrice) {
          const after = applyExecution(nextState, order, price);
          if (after !== nextState) {
            const updatedOrder = after.orders.find((o) => o.id === order.id);
            if (updatedOrder && updatedOrder.status === "EXECUTED") {
              executed.push(updatedOrder);
            }
            nextState = after;
          }
        }
      }
      continue;
    }

    if (order.type === "STOP_LIMIT") {
      if (order.stopPrice == null || order.limitPrice == null) continue;

      if (order.status === "PENDING") {
        if (order.side === "BUY" && price >= order.stopPrice) {
          nextState = {
            ...nextState,
            orders: nextState.orders.map((o) =>
              o.id === order.id ? { ...o, status: "ACTIVE" } : o
            ),
          };
        }
        if (order.side === "SELL" && price <= order.stopPrice) {
          nextState = {
            ...nextState,
            orders: nextState.orders.map((o) =>
              o.id === order.id ? { ...o, status: "ACTIVE" } : o
            ),
          };
        }
        continue;
      }

      if (order.status === "ACTIVE") {
        if (order.side === "BUY" && price <= order.limitPrice) {
          const after = applyExecution(nextState, order, price);
          if (after !== nextState) {
            const updatedOrder = after.orders.find((o) => o.id === order.id);
            if (updatedOrder && updatedOrder.status === "EXECUTED") {
              executed.push(updatedOrder);
            }
            nextState = after;
          }
        }
        if (order.side === "SELL" && price >= order.limitPrice) {
          const after = applyExecution(nextState, order, price);
          if (after !== nextState) {
            const updatedOrder = after.orders.find((o) => o.id === order.id);
            if (updatedOrder && updatedOrder.status === "EXECUTED") {
              executed.push(updatedOrder);
            }
            nextState = after;
          }
        }
      }
    }
  }

  return { state: nextState, executed };
}

export function computePaperEquity(
  state: PaperTradingState,
  prices: Record<string, number>
): { equity: number; unrealizedPnL: number } {
  let unrealized = 0;
  let marketValue = 0;

  for (const position of state.positions) {
    // If we don't have a live price for this asset (e.g. looking at another chart),
    // use the avgPrice so the equity doesn't crash.
    const price = prices[position.symbol] || position.avgPrice;
    
    unrealized += (price - position.avgPrice) * position.quantity;
    marketValue += price * position.quantity;
  }

  // Equity = Cash Balance + Total Market Value of Positions
  const equity = state.balance + marketValue;
  return { equity, unrealizedPnL: unrealized };
}

// Get current price from candlestick data
export function getCurrentPrice(data: CandlestickData<Time>[]): number {
  if (data.length === 0) return 0;
  return data[data.length - 1].close;
}

// Mock leaderboard data
export const mockLeaderboard = [
  { rank: 1, name: "Ahmed M.", profit: 18.5, trades: 47, winRate: 72 },
  { rank: 2, name: "Sarah K.", profit: 15.2, trades: 38, winRate: 68 },
  { rank: 3, name: "Mohammed A.", profit: 14.8, trades: 52, winRate: 65 },
  { rank: 4, name: "Fatima Z.", profit: 12.3, trades: 29, winRate: 76 },
  { rank: 5, name: "Youssef H.", profit: 11.7, trades: 41, winRate: 63 },
  { rank: 6, name: "Leila B.", profit: 10.9, trades: 35, winRate: 71 },
  { rank: 7, name: "Omar T.", profit: 9.8, trades: 44, winRate: 59 },
  { rank: 8, name: "Nadia R.", profit: 8.5, trades: 28, winRate: 75 },
  { rank: 9, name: "Karim S.", profit: 7.2, trades: 33, winRate: 67 },
  { rank: 10, name: "Amal D.", profit: 6.8, trades: 25, winRate: 72 },
];
