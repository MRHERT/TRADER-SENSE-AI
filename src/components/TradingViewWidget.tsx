import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidgetComponent({ symbol }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  // Map internal symbols to TradingView symbols
  const getTradingViewSymbol = (s: string) => {
    switch (s) {
      case "AAPL": return "NASDAQ:AAPL";
      case "TSLA": return "NASDAQ:TSLA";
      case "GOOGL": return "NASDAQ:GOOGL";
      case "MSFT": return "NASDAQ:MSFT";
      case "BTC-USD": return "BINANCE:BTCUSDT";
      case "ETH-USD": return "BINANCE:ETHUSDT";
      // Moroccan Stocks - Using Casablanca Stock Exchange symbols
      // IAM (Maroc Telecom) -> "CSEMA:IAM"
      // ATW (Attijariwafa Bank) -> "CSEMA:ATW"
      case "IAM.PA": return "CSEMA:IAM";
      case "ATW.PA": return "CSEMA:ATW";
      default: return "NASDAQ:AAPL";
    }
  };

  useEffect(() => {
    if (!container.current) return;

    // Clear previous script
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": getTradingViewSymbol(symbol),
      "interval": "1",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "withdateranges": true,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="h-full w-full relative" ref={container}>
      <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);
