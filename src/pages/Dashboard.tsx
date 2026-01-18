import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TradingChart } from "@/components/TradingChart";
import { AssetSelector, type MarketScope } from "@/components/AssetSelector";
import { TradeExecution } from "@/components/TradeExecution";
import { ChallengeStatus } from "@/components/ChallengeStatus";
import { AISignalPanel } from "@/components/AISignalPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  generateMockCandlestickData,
  getCurrentPrice,
  generateAISignal,
  type PaperTradingState,
  loadPaperTradingState,
  savePaperTradingState,
  createPaperOrder,
  processPaperOrdersWithPrice,
  computePaperEquity,
} from "@/lib/trading";
import { CandlestickData, Time } from "lightweight-charts";
import { RefreshCw, LogOut } from "lucide-react";
import { useLanguage, type LanguageKey } from "@/contexts/LanguageContext";

const API_BASE =
  typeof window !== "undefined" && window.location.port === "8080"
    ? "http://localhost:5000"
    : "";

type ChallengeStatusType = "ACTIVE" | "SUCCESSFUL" | "FAILED";
type SignalType = "BUY" | "SELL" | "HOLD";

type TradeHistoryItem = {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
};

interface ChallengeState {
  id: number | null;
  planName: string | null;
  status: ChallengeStatusType;
  startingBalance: number;
  currentBalance: number;
  currentEquity: number;
  profitTarget: number;
  dailyLossLimit: number;
  totalLossLimit: number;
  todayPnL: number;
}

const initialChallenge: ChallengeState = {
  id: null,
  planName: null,
  status: "ACTIVE",
  startingBalance: 5000,
  currentBalance: 5000,
  currentEquity: 5000,
  profitTarget: 10,
  dailyLossLimit: 5,
  totalLossLimit: 10,
  todayPnL: 0,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [chartData, setChartData] = useState<CandlestickData<Time>[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [challenge, setChallenge] = useState<ChallengeState>(initialChallenge);
  const [aiSignal, setAiSignal] = useState<{
    signal: SignalType;
    confidence: number;
    reasonKey: LanguageKey;
  }>({
    signal: "HOLD",
    confidence: 50,
    reasonKey: "dashboard_ai_initial_reason",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [marketScope, setMarketScope] = useState<MarketScope>("international");
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);

  const quoteCurrency = marketScope === "national" ? "MAD" : "USD";
  const [paperState, setPaperState] = useState<PaperTradingState | null>(null);

  const persistChallengeBalance = useCallback(
    (balance: number) => {
      if (!challenge.id) return;
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("ts_token")
          : null;
      if (!token) return;
      fetch(`${API_BASE}/api/challenge/update_balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          currentBalance: balance,
        }),
      }).catch(() => {});
    },
    [challenge.id]
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    let localUserEmail = "";

    if (!token) {
      navigate("/auth?redirect=/dashboard");
      return;
    }

    try {
      const rawUser =
        typeof window !== "undefined" ? window.localStorage.getItem("ts_user") : null;
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as { name?: string; email?: string };
        if (parsed && typeof parsed.name === "string" && typeof parsed.email === "string") {
          setUser({ name: parsed.name, email: parsed.email });
          localUserEmail = parsed.email;
        }
      }
    } catch {
      setUser(null);
    }

    const loadChallenge = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/challenge/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          navigate("/auth?redirect=/dashboard");
          return;
        }

        if (!response.ok) {
          setIsLoadingChallenge(false);
          return;
        }

        const data = await response.json();
        if (!data || !data.challenge) {
          setIsLoadingChallenge(false);
          navigate("/challenges");
          return;
        }

        const c = data.challenge as {
          id: number;
          planName?: string;
          status: ChallengeStatusType;
          startingBalance: number;
          currentBalance: number;
          currentEquity: number;
          profitTarget: number;
          dailyLossLimit: number;
          totalLossLimit: number;
          todayPnL?: number;
        };

        setChallenge({
          id: c.id,
          planName: c.planName || null,
          status: c.status,
          startingBalance: c.startingBalance,
          currentBalance: c.currentBalance,
          currentEquity: c.currentEquity,
          profitTarget: c.profitTarget,
          dailyLossLimit: c.dailyLossLimit,
          totalLossLimit: c.totalLossLimit,
          todayPnL: c.todayPnL ?? 0,
        });

        if (c.id) {
          const state = loadPaperTradingState(
            localUserEmail || "",
            c.id,
            c.currentBalance
          );
          setPaperState(state);

          try {
            const historyResponse = await fetch(
              `${API_BASE}/api/trade/history?challengeId=${c.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              const trades = Array.isArray(historyData.trades)
                ? historyData.trades
                : [];
              setTradeHistory(trades);
            }
          } catch {
            // Ignore history load errors
          }
        }
      } finally {
        setIsLoadingChallenge(false);
      }
    };

    const loadInitialMarket = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/market/price/${encodeURIComponent(selectedTicker)}`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const price = Number(data.price) || 0;
        if (!price) {
          return;
        }
        setChartData((prev) => {
          const baseData =
            prev.length === 0 ? generateMockCandlestickData(selectedTicker, 100) : prev;
          const updated = [...baseData];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0) {
            const last = updated[lastIndex];
            const close = price;
            const high = Math.max(last.high, close);
            const low = Math.min(last.low, close);
            updated[lastIndex] = {
              ...last,
              close,
              high,
              low,
            };
          }
          setCurrentPrice(price);
          setAiSignal(generateAISignal(updated));
          return updated;
        });
      } catch {
        toast({
          title: t("pricing_error_title"),
          description: t("dashboard_error_market_data"),
          variant: "destructive",
        });
      }
    };

    setChartData(generateMockCandlestickData(selectedTicker, 100));
    setCurrentPrice((data) => (data ? data : 0));
    loadChallenge();
    loadInitialMarket();
  }, [navigate, selectedTicker, t]);

  // Load chart data when ticker changes
  useEffect(() => {
    const data = generateMockCandlestickData(selectedTicker, 100);
    setChartData(data);
    setCurrentPrice(getCurrentPrice(data));
    setAiSignal(generateAISignal(data));
  }, [selectedTicker]);

  useEffect(() => {
    const isNational = marketScope === "national";
    const nationalTickers = ["IAM.PA", "ATW.PA"];
    const internationalTickers = ["AAPL", "TSLA", "GOOGL", "MSFT", "BTC-USD", "ETH-USD"];
    if (isNational && !nationalTickers.includes(selectedTicker)) {
      setSelectedTicker(nationalTickers[0]);
    }
    if (!isNational && !internationalTickers.includes(selectedTicker)) {
      setSelectedTicker(internationalTickers[0]);
    }
  }, [marketScope, selectedTicker]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        if (prev.length === 0) return prev;

        const lastCandle = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * lastCandle.close * 0.002;
        const newClose = parseFloat((lastCandle.close + change).toFixed(2));
        const newHigh = Math.max(lastCandle.high, newClose);
        const newLow = Math.min(lastCandle.low, newClose);

        const updatedData = [...prev];
        updatedData[updatedData.length - 1] = {
          ...lastCandle,
          close: newClose,
          high: newHigh,
          low: newLow,
        };

        setCurrentPrice(newClose);
        return updatedData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedTicker]);

  useEffect(() => {
    if (!challenge.id || !paperState || !currentPrice) return;
    const emailKey = user?.email || "";
    const result = processPaperOrdersWithPrice(paperState, selectedTicker, currentPrice);
    if (result.state === paperState) return;
    setPaperState(result.state);
    if (emailKey) {
      savePaperTradingState(emailKey, challenge.id, result.state);
    }
    const prices = { [selectedTicker]: currentPrice };
    const { equity, unrealizedPnL } = computePaperEquity(result.state, prices);
    setChallenge((prev) =>
      prev && prev.id === challenge.id
        ? {
            ...prev,
            currentBalance: result.state.balance,
            currentEquity: equity,
            todayPnL: unrealizedPnL,
          }
        : prev
    );
    persistChallengeBalance(result.state.balance);
  }, [challenge.id, currentPrice, paperState, selectedTicker, user, persistChallengeBalance]);

  const recentOrders = tradeHistory.slice(0, 8);

  const formatOrderTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const refresh = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/market/price/${encodeURIComponent(selectedTicker)}`);
        if (!response.ok) {
          setIsRefreshing(false);
          return;
        }
        const data = await response.json();
        const price = Number(data.price) || 0;
        if (!price) {
          setIsRefreshing(false);
          return;
        }
        setChartData((prev) => {
          if (prev.length === 0) {
            const generated = generateMockCandlestickData(selectedTicker, 100);
            const lastIndex = generated.length - 1;
            if (lastIndex >= 0) {
              const last = generated[lastIndex];
              const high = Math.max(last.high, price);
              const low = Math.min(last.low, price);
              generated[lastIndex] = {
                ...last,
                close: price,
                high,
                low,
              };
            }
            setCurrentPrice(price);
            setAiSignal(generateAISignal(generated));
            return generated;
          }
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          const last = updated[lastIndex];
          const high = Math.max(last.high, price);
          const low = Math.min(last.low, price);
          updated[lastIndex] = {
            ...last,
            close: price,
            high,
            low,
          };
          setCurrentPrice(price);
          setAiSignal(generateAISignal(updated));
          return updated;
        });
      } finally {
        setIsRefreshing(false);
      }
    };
    refresh();
  }, [selectedTicker]);

  const handleExecuteTrade = async (
    type: "BUY" | "SELL",
    quantity: number,
    price: number,
    orderType: "LIMIT" | "MARKET" | "STOP_LIMIT",
    params?: { limitPrice?: number; stopPrice?: number }
  ) => {
    if (!challenge.id) {
      toast({
        title: t("dashboard_no_active_challenge_title"),
        description: t("dashboard_no_active_challenge_desc"),
        variant: "destructive",
      });
      navigate("/challenges");
      return;
    }

    const emailKey = user?.email || "";

    const tradePrice =
      orderType === "MARKET" ? currentPrice || price : price;

    if (!Number.isFinite(tradePrice) || tradePrice <= 0 || quantity <= 0) {
      toast({
        title: t("dashboard_trade_failed"),
        description: t("dashboard_error_network_trade"),
        variant: "destructive",
      });
      return;
    }

    let baseState = paperState;
    if (!baseState) {
      const baseBalance =
        challenge.currentBalance ||
        challenge.startingBalance ||
        initialChallenge.startingBalance;
      baseState = loadPaperTradingState(emailKey, challenge.id, baseBalance);
    }

    if (type === "BUY") {
      const availableBalance = baseState.balance;
      const cost = quantity * tradePrice;
      if (cost > availableBalance) {
        toast({
          title: t("dashboard_trade_failed"),
          description: t("trade_error_insufficient_balance"),
          variant: "destructive",
        });
        return;
      }
    }

    if (type === "SELL") {
      const position = baseState.positions.find((p) => p.symbol === selectedTicker);
      if (!position || position.quantity < quantity) {
        toast({
          title: t("dashboard_trade_failed"),
          description: t("trade_error_insufficient_quantity"),
          variant: "destructive",
        });
        return;
      }
    }

    const limitPrice = params?.limitPrice;
    const stopPrice = params?.stopPrice;

    const withOrder = createPaperOrder(baseState, {
      challengeId: challenge.id,
      symbol: selectedTicker,
      side: type,
      type: orderType,
      quantity,
      limitPrice,
      stopPrice,
    });

    let nextState = withOrder;

    if (orderType === "MARKET") {
      const result = processPaperOrdersWithPrice(
        withOrder,
        selectedTicker,
        currentPrice || price
      );
      nextState = result.state;
    }

    setPaperState(nextState);
    if (emailKey) {
      savePaperTradingState(emailKey, challenge.id, nextState);
    }

    const prices = { [selectedTicker]: currentPrice || price };
    const { equity, unrealizedPnL } = computePaperEquity(nextState, prices);

    setChallenge((prev) =>
      prev && prev.id === challenge.id
        ? {
            ...prev,
            currentBalance: nextState.balance,
            currentEquity: equity,
            todayPnL: unrealizedPnL,
          }
        : prev
    );

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("ts_token")
        : null;

    if (token) {
      try {
        await fetch(`${API_BASE}/api/trade/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            challengeId: challenge.id,
            symbol: selectedTicker,
            side: type,
            quantity,
            price,
            pnl: 0,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    persistChallengeBalance(nextState.balance);

    if (orderType === "MARKET") {
      toast({
        title: `${type === "BUY" ? t("trade_buy") : t("trade_sell")} ${t(
          "dashboard_order_executed_suffix"
        )}`,
        description: `${quantity} ${selectedTicker} @ ${price.toFixed(2)} ${quoteCurrency}`,
      });
    } else {
      toast({
        title: t("dashboard_trade_pending_title"),
        description: t("dashboard_trade_pending_desc"),
      });
    }
  };

  const handleClearHistory = () => {
    if (!challenge.id || !paperState) return;
    const emailKey = user?.email || "";
    const nextState = {
      ...paperState,
      orders: [],
    };
    setPaperState(nextState);
    if (emailKey) {
      savePaperTradingState(emailKey, challenge.id, nextState);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ts_token");
      window.localStorage.removeItem("ts_user");
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          {/* Asset Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <AssetSelector
                selected={selectedTicker}
                onSelect={setSelectedTicker}
                marketScope={marketScope}
                onMarketScopeChange={setMarketScope}
              />
              <Button
                variant="glass"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {t("dashboard_refresh")}
              </Button>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Challenge Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card variant="glass" className="p-4">
                <ChallengeStatus
                  status={challenge.status}
                  startingBalance={challenge.startingBalance}
                  currentBalance={challenge.currentBalance}
                  currentEquity={challenge.currentEquity}
                  profitTarget={challenge.profitTarget}
                  dailyLossLimit={challenge.dailyLossLimit}
                  totalLossLimit={challenge.totalLossLimit}
                  todayPnL={challenge.todayPnL}
                  positions={paperState?.positions || []}
                />
              </Card>
            </motion.div>

            {/* Center - Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-6"
            >
              <Card variant="glass" className="p-4 h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg">
                    {selectedTicker} {t("dashboard_chart_label")}
                  </h2>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-primary">
                      {currentPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {quoteCurrency}
                    </div>
                  </div>
                </div>
                <TradingChart
                  ticker={selectedTicker}
                  data={chartData}
                  onPriceUpdate={setCurrentPrice}
                />
              </Card>

              {/* Trade Execution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Card variant="glass" className="p-4">
                  {(() => {
                    const position = paperState?.positions.find(
                      (p) => p.symbol === selectedTicker
                    );
                    const ownedQuantity = position ? position.quantity : 0;
                    return (
                      <TradeExecution
                        ticker={selectedTicker}
                        currentPrice={currentPrice}
                        balance={challenge.currentBalance}
                        quoteCurrency={quoteCurrency}
                        ownedQuantity={ownedQuantity}
                        onExecuteTrade={handleExecuteTrade}
                        disabled={challenge.status !== "ACTIVE"}
                      />
                    );
                  })()}
                </Card>
              </motion.div>
            </motion.div>

            {/* Right Sidebar - AI Signal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="space-y-4">
                <AISignalPanel
                  signal={aiSignal.signal}
                  confidence={aiSignal.confidence}
                  reasonKey={aiSignal.reasonKey}
                  ticker={selectedTicker}
                />
                <Card variant="glass" className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-sm">
                      {t("trade_history_title")}
                    </h3>
                        {recentOrders.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearHistory}
                        className="text-[11px]"
                      >
                        {t("trade_history_clear")}
                      </Button>
                    )}
                  </div>
                  {recentOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t("trade_history_empty")}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Time</TableHead>
                          <TableHead className="text-xs">Asset</TableHead>
                          <TableHead className="text-xs">Side</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs text-right">
                            Qty
                          </TableHead>
                          <TableHead className="text-xs text-right">
                            Price
                          </TableHead>
                          <TableHead className="text-xs text-right">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map((order) => {
                          const displayPrice = order.price;
                          const sideClass =
                            order.side === "BUY" ? "text-profit" : "text-loss";
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="text-[11px] text-muted-foreground">
                                {formatOrderTime(order.createdAt)}
                              </TableCell>
                              <TableCell className="text-[11px] font-mono">
                                {order.symbol}
                              </TableCell>
                              <TableCell
                                className={`text-[11px] font-mono ${sideClass}`}
                              >
                                {order.side}
                              </TableCell>
                              <TableCell className="text-[11px] font-mono">
                                MARKET
                              </TableCell>
                              <TableCell className="text-[11px] font-mono text-right">
                                {order.quantity.toFixed(4)}
                              </TableCell>
                              <TableCell className="text-[11px] font-mono text-right">
                                {displayPrice
                                  ? displayPrice.toFixed(4)
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-[11px] font-mono text-right">
                                {order.status}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
