import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type OrderType = "LIMIT" | "MARKET" | "STOP_LIMIT";

interface TradeExecutionProps {
  ticker: string;
  currentPrice: number;
  balance: number;
  quoteCurrency: string;
  ownedQuantity: number;
  onExecuteTrade: (
    type: "BUY" | "SELL",
    quantity: number,
    price: number,
    orderType: OrderType,
    params?: { limitPrice?: number; stopPrice?: number }
  ) => Promise<void>;
  disabled?: boolean;
}

export function TradeExecution({
  ticker,
  currentPrice,
  balance,
  quoteCurrency,
  ownedQuantity,
  onExecuteTrade,
  disabled,
}: TradeExecutionProps) {
  const { t } = useLanguage();
  const [orderType, setOrderType] = useState<OrderType>("LIMIT");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [stopPrice, setStopPrice] = useState<string>("");
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [sellAmount, setSellAmount] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastAction, setLastAction] = useState<"BUY" | "SELL" | null>(null);

  const resolvedPrice =
    orderType === "MARKET"
      ? currentPrice
      : parseFloat(limitPrice) || currentPrice;

  const numericBuyAmount = parseFloat(buyAmount) || 0;
  const numericSellAmount = parseFloat(sellAmount) || 0;
  const buyTotal = numericBuyAmount * resolvedPrice;
  const sellTotal = numericSellAmount * resolvedPrice;
  const minNotional = 5;
  const canAffordBuy = buyTotal <= balance && buyTotal >= minNotional;
  const hasEnoughForSell = sellTotal >= minNotional;

  const handleTrade = async (side: "BUY" | "SELL") => {
    if (isExecuting || disabled) return;
    const amount = side === "BUY" ? numericBuyAmount : numericSellAmount;
    if (amount <= 0) return;
    if (side === "BUY" && !canAffordBuy) return;
    if (side === "SELL" && !hasEnoughForSell) return;

    const numericLimit = parseFloat(limitPrice) || undefined;
    const numericStop = parseFloat(stopPrice) || undefined;

    setIsExecuting(true);
    setLastAction(side);
    try {
      await onExecuteTrade(side, amount, resolvedPrice, orderType, {
        limitPrice: orderType !== "MARKET" ? numericLimit : undefined,
        stopPrice: orderType === "STOP_LIMIT" ? numericStop : undefined,
      });
      if (side === "BUY") {
        setBuyAmount("");
      } else {
        setSellAmount("");
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const formatCurrency = (value: number) =>
    `${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${quoteCurrency}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">
          {t("trade_title")} {ticker}
        </h3>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">
            {t("trade_current_price")}
          </div>
          <div className="font-mono text-lg font-bold text-primary">
            {formatCurrency(currentPrice)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">{t("trade_mode_spot")}</span>
        <span className="font-mono">
          {t("trade_label_available_short")}: {formatCurrency(balance)}
        </span>
      </div>

      <div className="flex gap-2 rounded-lg bg-secondary/60 p-1 text-xs font-medium">
        <button
          type="button"
          className={`flex-1 rounded-md py-1 ${
            orderType === "LIMIT"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
          onClick={() => setOrderType("LIMIT")}
        >
          {t("trade_type_limit")}
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-1 ${
            orderType === "MARKET"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
          onClick={() => setOrderType("MARKET")}
        >
          {t("trade_type_market")}
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-1 ${
            orderType === "STOP_LIMIT"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
          onClick={() => setOrderType("STOP_LIMIT")}
        >
          {t("trade_type_stop_limit")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-secondary/60 p-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium">{t("trade_buy")}</span>
          </div>
          {orderType !== "MARKET" && (
            <div className="space-y-1">
              <Label htmlFor="buy-price" className="text-xs text-muted-foreground">
                {t("trade_label_price")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="buy-price"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="font-mono text-xs"
                  disabled={disabled}
                />
                <span className="text-[11px] text-muted-foreground">
                  {quoteCurrency}
                </span>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="buy-amount" className="text-xs text-muted-foreground">
              {t("trade_label_amount")}
            </Label>
            <Input
              id="buy-amount"
              type="number"
              min="0"
              step="0.0001"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="font-mono text-xs"
              disabled={disabled}
            />
          </div>
          {orderType === "STOP_LIMIT" && (
            <div className="space-y-1">
              <Label htmlFor="buy-stop" className="text-xs text-muted-foreground">
                {t("trade_label_stop_price")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="buy-stop"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="font-mono text-xs"
                  disabled={disabled}
                />
                <span className="text-[11px] text-muted-foreground">
                  {quoteCurrency}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              {t("trade_label_total")}
            </span>
            <span
              className={`font-mono font-semibold ${
                !canAffordBuy && numericBuyAmount > 0 ? "text-loss" : ""
              }`}
            >
              {formatCurrency(buyTotal || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {t("trade_label_minimum")} {minNotional} {quoteCurrency}
            </span>
          </div>
          <Button
            variant="buy"
            size="lg"
            className="w-full mt-2"
            onClick={() => handleTrade("BUY")}
            disabled={disabled || isExecuting || !canAffordBuy}
          >
            {isExecuting && lastAction === "BUY" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                {t("trade_buy")}
              </>
            )}
          </Button>
          {!canAffordBuy && numericBuyAmount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-loss text-center"
            >
              {t("trade_error_insufficient_balance")}
            </motion.p>
          )}
        </div>

        <div className="rounded-lg bg-secondary/60 p-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium">{t("trade_sell")}</span>
          </div>
          {orderType !== "MARKET" && (
            <div className="space-y-1">
              <Label htmlFor="sell-price" className="text-xs text-muted-foreground">
                {t("trade_label_price")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sell-price"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="font-mono text-xs"
                  disabled={disabled}
                />
                <span className="text-[11px] text-muted-foreground">
                  {quoteCurrency}
                </span>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <button
              type="button"
              className="text-[11px] text-muted-foreground text-left"
              onClick={() => {
                const safeQuantity = ownedQuantity > 0 ? ownedQuantity : 0;
                setSellAmount(
                  safeQuantity > 0 ? safeQuantity.toFixed(4) : ""
                );
              }}
            >
              {t("trade_available")}:{" "}
              {ownedQuantity.toFixed(4)} {ticker}
            </button>
            <Label htmlFor="sell-amount" className="text-xs text-muted-foreground">
              {t("trade_label_amount")}
            </Label>
            <Input
              id="sell-amount"
              type="number"
              min="0"
              step="0.0001"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="font-mono text-xs"
              disabled={disabled}
            />
          </div>
          {orderType === "STOP_LIMIT" && (
            <div className="space-y-1">
              <Label htmlFor="sell-stop" className="text-xs text-muted-foreground">
                {t("trade_label_stop_price")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sell-stop"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="font-mono text-xs"
                  disabled={disabled}
                />
                <span className="text-[11px] text-muted-foreground">
                  {quoteCurrency}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              {t("trade_label_total")}
            </span>
            <span
              className={`font-mono font-semibold ${
                !hasEnoughForSell && numericSellAmount > 0 ? "text-loss" : ""
              }`}
            >
              {formatCurrency(sellTotal || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {t("trade_label_minimum")} {minNotional} {quoteCurrency}
            </span>
          </div>
          <Button
            variant="sell"
            size="lg"
            className="w-full mt-2"
            onClick={() => handleTrade("SELL")}
            disabled={disabled || isExecuting || !hasEnoughForSell}
          >
            {isExecuting && lastAction === "SELL" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <TrendingDown className="h-4 w-4" />
                {t("trade_sell")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
