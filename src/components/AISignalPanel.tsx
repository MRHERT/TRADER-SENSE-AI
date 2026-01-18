import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage, type LanguageKey } from "@/contexts/LanguageContext";

type SignalType = "BUY" | "SELL" | "HOLD";

interface AISignalPanelProps {
  signal: SignalType;
  confidence: number;
  reasonKey: LanguageKey;
  ticker: string;
}

export function AISignalPanel({ signal, confidence, reasonKey, ticker }: AISignalPanelProps) {
  const { t } = useLanguage();
  const getSignalConfig = (signalType: SignalType) => {
    switch (signalType) {
      case "BUY":
        return {
          icon: TrendingUp,
          color: "text-profit",
          bgColor: "bg-profit/10",
          borderColor: "border-profit/30",
          label: t("ai_signal_strong_buy"),
        };
      case "SELL":
        return {
          icon: TrendingDown,
          color: "text-loss",
          bgColor: "bg-loss/10",
          borderColor: "border-loss/30",
          label: t("ai_signal_sell"),
        };
      case "HOLD":
        return {
          icon: Minus,
          color: "text-neutral",
          bgColor: "bg-neutral/10",
          borderColor: "border-neutral/30",
          label: t("ai_signal_hold"),
        };
    }
  };

  const config = getSignalConfig(signal);
  const Icon = config.icon;

  return (
    <Card variant="glass" className={`p-4 ${config.borderColor}`}>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("ai_signal_title")}</span>
      </div>

      <motion.div
        key={signal}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border mb-4`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${config.color}`} />
            <span className={`font-display font-bold text-lg ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{ticker}</div>
      </motion.div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t("ai_signal_confidence")}</span>
            <span className="font-mono font-semibold">{confidence}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${
                confidence > 70 ? "bg-profit" : confidence > 40 ? "bg-neutral" : "bg-loss"
              }`}
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">
            {t("ai_signal_analysis")}
          </div>
          <p className="text-sm">{t(reasonKey)}</p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {t("ai_signal_disclaimer")}
          </p>
        </div>
      </div>
    </Card>
  );
}
