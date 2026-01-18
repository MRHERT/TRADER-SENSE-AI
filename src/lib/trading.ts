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
  for (const position of state.positions) {
    const price = prices[position.symbol];
    if (!price) continue;
    unrealized += (price - position.avgPrice) * position.quantity;
  }
  const equity = state.balance + unrealized;
  return { equity, unrealizedPnL: unrealized };
}

export function generateMockCandlestickData(
  ticker: string,
  days: number = 100
): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 24 * 60 * 60;

  // Different base prices for different tickers
  const basePrices: Record<string, number> = {
    AAPL: 185,
    TSLA: 245,
    GOOGL: 175,
    MSFT: 420,
    "BTC-USD": 95000,
    "ETH-USD": 3400,
    "IAM.PA": 120,
    "ATW.PA": 450,
  };

  let price = basePrices[ticker] || 100;
  const volatility = ticker.includes("BTC") || ticker.includes("ETH") ? 0.03 : 0.015;

  for (let i = days; i >= 0; i--) {
    const time = (now - i * dayInSeconds) as Time;
    const change = (Math.random() - 0.5) * price * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    price = close;
  }

  return data;
}

// Get current price from candlestick data
export function getCurrentPrice(data: CandlestickData<Time>[]): number {
  if (data.length === 0) return 0;
  return data[data.length - 1].close;
}

// Calculate simple moving average
export function calculateSMA(data: CandlestickData<Time>[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    sma.push(sum / period);
  }
  return sma;
}

// Generate AI signal based on simple moving average crossover
export function generateAISignal(
  data: CandlestickData<Time>[]
): { signal: "BUY" | "SELL" | "HOLD"; confidence: number; reasonKey: LanguageKey } {
  if (data.length < 20) {
    return { signal: "HOLD", confidence: 50, reasonKey: "ai_reason_not_enough_data" };
  }

  const shortSMA = calculateSMA(data.slice(-20), 5);
  const longSMA = calculateSMA(data.slice(-20), 15);

  const currentShort = shortSMA[shortSMA.length - 1];
  const currentLong = longSMA[longSMA.length - 1];
  const prevShort = shortSMA[shortSMA.length - 2];
  const prevLong = longSMA[longSMA.length - 2];

  const currentPrice = data[data.length - 1].close;
  const priceAboveSMA = currentPrice > currentShort;

  // Golden cross (bullish)
  if (prevShort <= prevLong && currentShort > currentLong) {
    return {
      signal: "BUY",
      confidence: 85,
      reasonKey: "ai_reason_golden_cross",
    };
  }

  // Death cross (bearish)
  if (prevShort >= prevLong && currentShort < currentLong) {
    return {
      signal: "SELL",
      confidence: 80,
      reasonKey: "ai_reason_death_cross",
    };
  }

  // Bullish trend
  if (currentShort > currentLong && priceAboveSMA) {
    return {
      signal: "BUY",
      confidence: 70,
      reasonKey: "ai_reason_bull_trend",
    };
  }

  // Bearish trend
  if (currentShort < currentLong && !priceAboveSMA) {
    return {
      signal: "SELL",
      confidence: 65,
      reasonKey: "ai_reason_bear_trend",
    };
  }

  return {
    signal: "HOLD",
    confidence: 55,
    reasonKey: "ai_reason_consolidation",
  };
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
