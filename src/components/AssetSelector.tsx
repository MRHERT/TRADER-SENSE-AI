import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const tickers = [
  { symbol: "AAPL", name: "Apple Inc.", type: "international" as const },
  { symbol: "TSLA", name: "Tesla Inc.", type: "international" as const },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "international" as const },
  { symbol: "MSFT", name: "Microsoft", type: "international" as const },
  { symbol: "BTC-USD", name: "Bitcoin", type: "international" as const },
  { symbol: "ETH-USD", name: "Ethereum", type: "international" as const },
  { symbol: "IAM.PA", name: "Maroc Telecom", type: "national" as const },
  { symbol: "ATW.PA", name: "Attijariwafa Bank", type: "national" as const },
] as const;

export type MarketScope = "international" | "national";

interface AssetSelectorProps {
  selected: string;
  onSelect: (ticker: string) => void;
  marketScope: MarketScope;
  onMarketScopeChange: (scope: MarketScope) => void;
}

export function AssetSelector({
  selected,
  onSelect,
  marketScope,
  onMarketScopeChange,
}: AssetSelectorProps) {
  const { t } = useLanguage();
  const filteredTickers = tickers.filter((ticker) => ticker.type === marketScope);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display font-semibold text-sm">
          {t("asset_selector_title")}
        </h3>
        <div className="inline-flex rounded-full bg-secondary/60 p-1 text-xs">
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-colors",
              marketScope === "international"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground"
            )}
            onClick={() => onMarketScopeChange("international")}
          >
            {t("asset_selector_scope_international")}
          </button>
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-colors",
              marketScope === "national"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground"
            )}
            onClick={() => onMarketScopeChange("national")}
          >
            {t("asset_selector_scope_national")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filteredTickers.map((ticker) => (
          <Button
            key={ticker.symbol}
            variant="glass"
            size="sm"
            onClick={() => onSelect(ticker.symbol)}
            className={cn(
              "flex flex-col items-start h-auto py-2 px-3",
              selected === ticker.symbol && "border-primary bg-primary/10"
            )}
          >
            <span className="font-mono font-semibold text-sm">
              {ticker.symbol}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {ticker.name}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
