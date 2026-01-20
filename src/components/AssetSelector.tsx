import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { RefreshCw } from "lucide-react";

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
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AssetSelector({
  selected,
  onSelect,
  marketScope,
  onMarketScopeChange,
  onRefresh,
  isRefreshing
}: AssetSelectorProps) {
  const { t } = useLanguage();
  const filteredTickers = tickers.filter((ticker) => ticker.type === marketScope);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display font-semibold text-sm">
          {t("asset_selector_title")}
        </h3>
        
        <div className="flex items-center gap-2">
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
            
            {onRefresh && (
                <Button 
                    variant="glass" 
                    size="icon" 
                    onClick={onRefresh}
                    className="h-8 w-8 ml-2"
                >
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
            )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filteredTickers.map((ticker) => (
          <Button
            key={ticker.symbol}
            variant="glass"
            size="sm"
            onClick={() => onSelect(ticker.symbol)}
            className={cn(
              "flex-none flex flex-col items-start h-auto py-2 px-3 min-w-[120px]",
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
