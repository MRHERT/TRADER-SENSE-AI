import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { AssetSelector, type MarketScope } from "@/components/AssetSelector";
import { TradeExecution } from "@/components/TradeExecution";
import { ChallengeStatus } from "@/components/ChallengeStatus";
import { AISignalPanel } from "@/components/AISignalPanel";
import { PositionsTable } from "@/components/PositionsTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  getCurrentPrice,
  type PaperTradingState,
  computePaperEquity,
} from "@/lib/trading";
import { RefreshCw, LogOut } from "lucide-react";
import { useLanguage, type LanguageKey } from "@/contexts/LanguageContext";
import { API_BASE } from "@/config";

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
  yesterdayEquity: number;
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
  yesterdayEquity: 5000,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [prices, setPrices] = useState<Record<string, { price: number; changePercent: number }>>({});
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
      const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
      if (!token) return;
      fetch(`${API_BASE}/api/challenge/update_balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          currentBalance: balance, // Backend currently expects this field name for balance update
        }),
      }).catch(() => {});
    },
    [challenge.id]
  );

  // Auth Check & User Load
  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/dashboard");
      return;
    }
    try {
      const rawUser = typeof window !== "undefined" ? window.localStorage.getItem("ts_user") : null;
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      }
    } catch {
      setUser(null);
    }
  }, [navigate]);

  // Load Challenge & Portfolio
  useEffect(() => {
    const loadData = async () => {
        const token = window.localStorage.getItem("ts_token");
        if (!token) return;

        try {
            // 1. Get Challenge
            const cRes = await fetch(`${API_BASE}/api/challenge/current`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!cRes.ok) throw new Error("Failed to load challenge");
            const cData = await cRes.json();
            if (!cData.challenge) {
                navigate("/challenges");
                return;
            }
            const c = cData.challenge;
            
            setChallenge({
                id: c.id,
                planName: c.planName,
                status: c.status,
                startingBalance: c.startingBalance,
                currentBalance: c.currentBalance,
                currentEquity: c.currentEquity,
                profitTarget: c.profitTarget,
                dailyLossLimit: c.dailyLossLimit,
                totalLossLimit: c.totalLossLimit,
                todayPnL: c.todayPnL || 0,
                yesterdayEquity: c.yesterdayEquity || c.startingBalance
            });

            // 2. Get Portfolio (Positions)
            const pfRes = await fetch(`${API_BASE}/api/trade/portfolio?challengeId=${c.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (pfRes.ok) {
                const pfData = await pfRes.json();
                const backendPositions = pfData.positions.map((p: any) => ({
                    symbol: p.symbol,
                    quantity: p.quantity,
                    avgPrice: p.avgPrice
                }));
                setPaperState({
                    balance: pfData.cashBalance,
                    positions: backendPositions,
                    orders: []
                });
            } else {
                setPaperState({
                    balance: c.currentBalance,
                    positions: [],
                    orders: []
                });
            }
            
            // 3. Get Trade History
            const hRes = await fetch(`${API_BASE}/api/trade/history?challengeId=${c.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (hRes.ok) {
                const hData = await hRes.json();
                setTradeHistory(hData.trades);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingChallenge(false);
        }
    };
    loadData();
  }, [navigate]);

  // Fetch Chart History removed as we use TradingView widget

  // Market Data Polling
  const fetchPrice = useCallback(async () => {
      // 1. Fetch selected ticker
      try {
          const res = await fetch(`${API_BASE}/api/market/price/${selectedTicker}`);
          if (res.ok) {
              const data = await res.json();
              const price = data.price;
              const changePercent = data.changePercent || 0;
              const timestamp = data.timestamp;
              
              setCurrentPrice(price);
              setPrices(prev => ({ ...prev, [selectedTicker]: { price, changePercent } }));
              
              // Update Chart
              setChartData(prev => {
                  if (!prev || prev.length === 0) return prev;
                  const updated = [...prev];
                  const lastCandle = updated[updated.length - 1];
                  
                  const lastTime = lastCandle.time as number;
                  if (typeof lastTime !== 'number') return updated;

                  // Check if we need a new candle
                  // National stocks (Morocco) are 5m (300s), International are 1m (60s)
                  const isNational = ["IAM.PA", "ATW.PA"].includes(selectedTicker);
                  const candleInterval = isNational ? 300 : 60;

                  if (timestamp >= lastTime + candleInterval) {
                      // Start new candle
                      updated.push({
                          time: (lastTime + candleInterval) as Time,
                          open: price,
                          high: price,
                          low: price,
                          close: price
                      });
                  } else {
                      // Update existing candle
                      updated[updated.length - 1] = {
                          ...lastCandle,
                          close: price,
                          high: Math.max(lastCandle.high, price),
                          low: Math.min(lastCandle.low, price)
                      };
                  }
                  return updated;
              });
          }
      } catch (e) {
          console.error("Price fetch error", e);
      }

      // 2. Fetch other held assets
      if (paperState?.positions) {
          paperState.positions.forEach(pos => {
              if (pos.symbol === selectedTicker) return;
              fetch(`${API_BASE}/api/market/price/${pos.symbol}`)
                  .then(res => res.ok ? res.json() : null)
                  .then(data => {
                      if (data) {
                          setPrices(prev => ({ ...prev, [pos.symbol]: { price: data.price, changePercent: data.changePercent || 0 } }));
                      }
                  })
                  .catch(() => {});
          });
      }
  }, [selectedTicker, paperState]);

  useEffect(() => {
      // Initial Load
      fetchPrice();
      
      const interval = setInterval(fetchPrice, 2000);
      return () => clearInterval(interval);
  }, [selectedTicker, fetchPrice]);

  // AI Signal Fetching
  const fetchAiSignal = useCallback(async () => {
      try {
          const res = await fetch(`${API_BASE}/api/market/signal/${selectedTicker}`);
          if (res.ok) {
              const data = await res.json();
              setAiSignal(data);
          }
      } catch (e) {
          console.error("Signal fetch error", e);
      }
  }, [selectedTicker]);

  useEffect(() => {
      fetchAiSignal();
      // Optional: Poll every minute?
      // const interval = setInterval(fetchAiSignal, 60000);
      // return () => clearInterval(interval);
  }, [selectedTicker, fetchAiSignal]);

  // Recalculate Equity on Price Change
  useEffect(() => {
      if (!paperState || !challenge.id) return;
      
      const simplePrices: Record<string, number> = {};
      Object.entries(prices).forEach(([symbol, data]) => {
        simplePrices[symbol] = data.price;
      });

      const { equity } = computePaperEquity(paperState, simplePrices);
      
      setChallenge(prev => {
            if (prev.id !== challenge.id) return prev;
            const pnl = equity - prev.yesterdayEquity;
            return {
                ...prev,
                currentEquity: equity,
                currentBalance: equity,
                todayPnL: pnl
            };
        });
      
      persistChallengeBalance(equity);
      
  }, [prices, paperState, challenge.id, persistChallengeBalance]);

  const handleExecuteTrade = async (
    type: "BUY" | "SELL",
    quantity: number,
    price: number,
    orderType: "LIMIT" | "MARKET" | "STOP_LIMIT",
    params?: { limitPrice?: number; stopPrice?: number }
  ) => {
      if (!challenge.id) return;
      const token = window.localStorage.getItem("ts_token");
      if (!token) return;

      try {
          if (price <= 0) {
              throw new Error("Price must be greater than 0");
          }

          const res = await fetch(`${API_BASE}/api/trade/execute`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  challengeId: challenge.id,
                  symbol: selectedTicker,
                  side: type,
                  quantity,
                  price,
                  pnl: 0,
                  orderType,
                  ...params
              })
          });

          if (!res.ok) {
              const text = await res.text();
              let errorMessage = "Trade failed";
              try {
                  const err = JSON.parse(text);
                  errorMessage = err.message || errorMessage;
              } catch {
                  errorMessage = text || errorMessage;
              }
              throw new Error(errorMessage);
          }

          const data = await res.json();
          toast({
              title: "Order Executed",
              description: `${type} ${quantity} ${selectedTicker} @ $${price}`
          });

          // Refresh Portfolio
          const pfRes = await fetch(`${API_BASE}/api/trade/portfolio?challengeId=${challenge.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (pfRes.ok) {
              const pfData = await pfRes.json();
              const backendPositions = pfData.positions.map((p: any) => ({
                  symbol: p.symbol,
                  quantity: p.quantity,
                  avgPrice: p.avgPrice
              }));
              setPaperState({
                  balance: pfData.cashBalance,
                  positions: backendPositions,
                  orders: []
              });
          }

          // Refresh History
          const hRes = await fetch(`${API_BASE}/api/trade/history?challengeId=${challenge.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (hRes.ok) {
              const hData = await hRes.json();
              setTradeHistory(hData.trades);
          }

      } catch (e: any) {
          toast({
              title: "Trade Failed",
              description: e.message,
              variant: "destructive"
          });
      }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("ts_token");
    window.localStorage.removeItem("ts_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          {/* Asset Selector */}
          <div className="mb-6 mt-8">
             <AssetSelector
                selected={selectedTicker}
                onSelect={setSelectedTicker}
                marketScope={marketScope}
                onMarketScopeChange={setMarketScope}
                onRefresh={fetchPrice}
                isRefreshing={isRefreshing}
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Chart */}
            <div className="lg:col-span-8 space-y-4">
              {/* Chart Area */}
              <Card className="p-4 border-white/5 bg-black/40 backdrop-blur-xl h-[500px] flex flex-col">
                <TradingViewWidget symbol={selectedTicker} />
              </Card>

              {/* Positions Table */}
              <PositionsTable 
                 positions={paperState?.positions || []} 
                 currentPrices={prices} 
                 onSelectAsset={setSelectedTicker}
              />
              {/* Trade History */}
              <Card variant="glass" className="p-4">
                  <h3 className="font-display font-semibold text-sm mb-4">Trade History</h3>
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Side</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tradeHistory.slice(0, 10).map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.symbol}</TableCell>
                                    <TableCell className={t.side === "BUY" ? "text-green-500" : "text-red-500"}>{t.side}</TableCell>
                                    <TableCell>{t.quantity}</TableCell>
                                    <TableCell>${t.price.toFixed(2)}</TableCell>
                                    <TableCell>{new Date(t.createdAt).toLocaleTimeString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
              </Card>
            </div>

            {/* Right Column: Stats & Trade */}
            <div className="lg:col-span-4 space-y-6">
               <ChallengeStatus 
                  status={challenge.status}
                  startingBalance={challenge.startingBalance}
                  currentBalance={challenge.currentBalance}
                  currentEquity={challenge.currentEquity}
                  profitTarget={challenge.profitTarget}
                  dailyLossLimit={challenge.dailyLossLimit}
                  totalLossLimit={challenge.totalLossLimit}
                  todayPnL={challenge.todayPnL}
                  yesterdayEquity={challenge.yesterdayEquity}
                  positions={paperState?.positions || []}
               />
               
               <Card variant="glass" className="p-6">
                 <TradeExecution
                   ticker={selectedTicker}
                   currentPrice={currentPrice}
                   balance={paperState?.balance || 0}
                   quoteCurrency={quoteCurrency}
                   ownedQuantity={paperState?.positions.find(p => p.symbol === selectedTicker)?.quantity || 0}
                   onExecuteTrade={handleExecuteTrade}
                 />
               </Card>

               <AISignalPanel
                 signal={aiSignal.signal}
                 confidence={aiSignal.confidence}
                 reasonKey={aiSignal.reasonKey}
                 ticker={selectedTicker}
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
