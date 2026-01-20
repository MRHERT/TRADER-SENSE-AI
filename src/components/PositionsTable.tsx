import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaperPosition } from "@/lib/trading";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface PositionsTableProps {
  positions: PaperPosition[];
  currentPrices: Record<string, { price: number; changePercent: number }>;
  onSelectAsset?: (symbol: string) => void;
}

export function PositionsTable({ positions, currentPrices, onSelectAsset }: PositionsTableProps) {
  const { t } = useLanguage();

  if (!positions || positions.length === 0) {
    return (
      <Card variant="glass" className="p-4">
        <h3 className="font-display font-semibold text-sm mb-3">
          {t("positions_title") || "Positions"}
        </h3>
        <div className="text-xs text-muted-foreground text-center py-4">
          {t("positions_empty") || "No open positions"}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-4">
      <h3 className="font-display font-semibold text-sm mb-3">
        {t("positions_title") || "Positions"}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-[60px]">Asset</TableHead>
              <TableHead className="text-xs text-right">Qty</TableHead>
              <TableHead className="text-xs text-right hidden sm:table-cell">Avg Cost</TableHead>
              <TableHead className="text-xs text-right">Price</TableHead>
              <TableHead className="text-xs text-right hidden sm:table-cell">24h Change</TableHead>
              <TableHead className="text-xs text-right">Value</TableHead>
              <TableHead className="text-xs text-right">PnL</TableHead>
              <TableHead className="text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => {
              // Fallback to avgPrice if current price is missing (e.g. not subscribed)
              const priceData = currentPrices[pos.symbol];
              const currentPrice = priceData ? priceData.price : pos.avgPrice;
              const changePercent = priceData ? priceData.changePercent : 0;
              
              const marketValue = pos.quantity * currentPrice;
              const costBasis = pos.quantity * pos.avgPrice;
              const pnl = marketValue - costBasis;
              const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
              const isProfit = pnl >= 0;
              const isChangePositive = changePercent >= 0;

              return (
                <TableRow key={pos.symbol}>
                  <TableCell className="text-[11px] font-mono font-bold">{pos.symbol}</TableCell>
                  <TableCell className="text-[11px] font-mono text-right">{pos.quantity.toFixed(4)}</TableCell>
                  <TableCell className="text-[11px] font-mono text-right hidden sm:table-cell">
                    ${pos.avgPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-right">
                    ${currentPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-[11px] font-mono text-right hidden sm:table-cell ${isChangePositive ? "text-profit" : "text-loss"}`}>
                    {isChangePositive ? "+" : ""}{changePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-right">
                    ${marketValue.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-[11px] font-mono text-right ${isProfit ? "text-profit" : "text-loss"}`}>
                    <div className="flex flex-col items-end">
                      <span>{isProfit ? "+" : ""}{pnl.toFixed(2)}</span>
                      <span className="text-[9px] opacity-70">{isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => onSelectAsset?.(pos.symbol)}
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
