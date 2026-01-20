import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChallengeStatusProps {
  status: "ACTIVE" | "SUCCESSFUL" | "FAILED";
  startingBalance: number;
  currentBalance: number;
  currentEquity: number;
  profitTarget: number;
  dailyLossLimit: number;
  totalLossLimit: number;
  todayPnL: number;
  yesterdayEquity?: number;
  positions: { symbol: string; quantity: number; avgPrice: number }[];
}

export function ChallengeStatus({
  status,
  startingBalance,
  currentBalance,
  currentEquity,
  profitTarget,
  dailyLossLimit,
  totalLossLimit,
  todayPnL,
  yesterdayEquity,
  positions,
}: ChallengeStatusProps) {
  const { t } = useLanguage();
  const effectiveStartingBalance = yesterdayEquity || startingBalance;
  const profitPercent = ((currentEquity - startingBalance) / startingBalance) * 100;
  const targetProgress = (profitPercent / profitTarget) * 100;
  // Daily P&L % based on yesterday's equity for display
  const todayPnLPercent = effectiveStartingBalance > 0 ? (todayPnL / effectiveStartingBalance) * 100 : 0;
  // Daily Loss Limit check usually based on starting balance or daily starting equity depending on rules
  // We'll use the same percentage for consistency with the display
  const dailyLossPercent = todayPnLPercent; 
  
  const totalLossPercent = ((startingBalance - currentEquity) / startingBalance) * 100;

  const isProfit = currentEquity >= startingBalance;
  const isDailyLossWarning = dailyLossPercent < -3;
  const isTotalLossWarning = totalLossPercent > 7;

  const getStatusBadge = () => {
    switch (status) {
      case "SUCCESSFUL":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-profit/20 text-profit">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-bold">{t("challenge_status_passed")}</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-loss/20 text-loss">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-bold">{t("challenge_status_failed")}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-bold">{t("challenge_status_active")}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">{t("challenge_status_title")}</h3>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card variant="stat" className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <DollarSign className="h-3 w-3" />
            {t("challenge_status_balance")}
          </div>
          <div className={`font-mono text-lg font-bold ${isProfit ? "text-profit" : "text-loss"}`}>
            ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </Card>

        <Card variant="stat" className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Target className="h-3 w-3" />
            {t("challenge_status_equity")}
          </div>
          <div className="font-mono text-lg font-bold">
            ${currentEquity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </div>

      <Card variant="stat" className={`p-3 ${isDailyLossWarning ? "border-warning/50" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            {todayPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {t("challenge_status_today_pnl")}
          </div>
          {isDailyLossWarning && <AlertTriangle className="h-4 w-4 text-warning" />}
        </div>
        <div className={`font-mono text-lg font-bold ${todayPnL >= 0 ? "text-profit" : "text-loss"}`}>
          {todayPnL >= 0 ? "+" : ""}${todayPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          <span className="text-sm ml-1">
            ({dailyLossPercent >= 0 ? "+" : ""}{dailyLossPercent.toFixed(2)}%)
          </span>
        </div>
      </Card>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t("challenge_status_profit_target")} ({profitTarget}%)
          </span>
          <span className={`font-mono font-semibold ${isProfit ? "text-profit" : "text-loss"}`}>
            {profitPercent >= 0 ? "+" : ""}{profitPercent.toFixed(2)}%
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(targetProgress, 0), 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-emerald-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border ${isDailyLossWarning ? "bg-warning/10 border-warning/30" : "bg-secondary/50 border-border/50"}`}>
          <div className="text-xs text-muted-foreground mb-1">
            {t("challenge_status_daily_loss_limit")}
          </div>
          <div className="font-mono text-sm font-semibold">
            {Math.abs(dailyLossPercent).toFixed(1)}% / {dailyLossLimit}%
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${isTotalLossWarning ? "bg-loss/10 border-loss/30" : "bg-secondary/50 border-border/50"}`}>
          <div className="text-xs text-muted-foreground mb-1">
            {t("challenge_status_total_loss_limit")}
          </div>
          <div className="font-mono text-sm font-semibold">
            {totalLossPercent.toFixed(1)}% / {totalLossLimit}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          {t("challenge_positions_title")}
        </div>
        {positions.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {t("challenge_positions_empty")}
          </div>
        ) : (
          <div className="space-y-1 text-xs font-mono">
            {positions.map((position) => (
              <div key={position.symbol} className="flex justify-between">
                <span>{position.symbol}</span>
                <span>
                  {position.quantity.toFixed(3)} @ ${position.avgPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
