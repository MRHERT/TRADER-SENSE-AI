from datetime import datetime, timezone

import requests
import yfinance as yf
from bs4 import BeautifulSoup
from flask import Blueprint, jsonify

market_bp = Blueprint("market", __name__)


def _get_binance_price(symbol: str) -> tuple[float, float]:
    # Map internal symbol to Binance symbol
    binance_symbol = symbol.replace("-", "").replace("USD", "USDT")
    
    try:
        # Get 24hr ticker data which has both last price and price change percent
        url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={binance_symbol}"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        current_price = float(data['lastPrice'])
        change_percent = float(data['priceChangePercent'])
        
        return current_price, change_percent
    except Exception as e:
        print(f"Binance API error for {symbol}: {e}")
        # Fallback to yfinance if Binance fails
        return _get_yfinance_price(symbol)

def _get_yfinance_price(symbol: str) -> tuple[float, float]:
    ticker = yf.Ticker(symbol)
    
    # 1. Try fast_info (most efficient and often real-time)
    try:
        if hasattr(ticker, 'fast_info'):
            current_price = ticker.fast_info.last_price
            prev_close = ticker.fast_info.previous_close
            
            if current_price is not None and prev_close is not None:
                change_percent = ((current_price - prev_close) / prev_close) * 100
                return float(current_price), float(change_percent)
    except Exception:
        pass

    # 2. Fallback to 1-minute interval data (intraday)
    try:
        data = ticker.history(period="1d", interval="1m")
        if not data.empty:
            current_price = float(data["Close"].iloc[-1])
            
            # Calculate change percent
            # Try to get previous close from daily data
            daily = ticker.history(period="5d")
            if len(daily) >= 2:
                # Use the second to last day as previous close
                # If market is open, 'today' is the last row, so -2 is yesterday
                prev_close = float(daily["Close"].iloc[-2])
                change_percent = ((current_price - prev_close) / prev_close) * 100
            else:
                change_percent = 0.0
                
            return current_price, change_percent
    except Exception:
        pass

    # 3. Ultimate Fallback (Daily Data)
    data = ticker.history(period="5d")
    if data.empty:
        raise ValueError("No market data")
    
    current_price = float(data["Close"].iloc[-1])
    
    if len(data) >= 2:
        prev_close = float(data["Close"].iloc[-2])
        change_percent = ((current_price - prev_close) / prev_close) * 100
    else:
        change_percent = 0.0
        
    return current_price, change_percent

def _get_international_price(symbol: str) -> tuple[float, float]:
    # Use Binance for Crypto
    if symbol in ["BTC-USD", "ETH-USD"]:
        return _get_binance_price(symbol)
    
    # Use Yahoo Finance for everything else
    return _get_yfinance_price(symbol)


def get_live_price(symbol: str) -> float:
    """
    Public helper to get the current price of a symbol.
    Returns 0.0 if failed.
    """
    try:
        if symbol in {"IAM.PA", "ATW.PA"}:
            price, _ = _get_casablanca_price(symbol)
        else:
            price, _ = _get_international_price(symbol)
        return price
    except Exception:
        return 0.0


import warnings
from urllib3.exceptions import InsecureRequestWarning

warnings.simplefilter('ignore', InsecureRequestWarning)

import time
import random

# Global Cache for Moroccan Data
# { symbol: { 'price': float, 'change': float, 'last_fetch': timestamp } }
MOROCCAN_CACHE = {}
CACHE_DURATION = 60  # 1 minute cache to avoid blocking

def _get_casablanca_price(symbol: str) -> tuple[float, float]:
    """
    Fetches price from casablancabourse.com directly.
    Symbol expected: IAM.PA -> IAM, ATW.PA -> ATW
    """
    code = symbol.split(".")[0]
    # Map to ensure we use the correct ticker if needed (though IAM/ATW seem standard)
    ticker_map = {
        "IAM": "IAM",
        "ATW": "ATW"
    }
    target_ticker = ticker_map.get(code, code)
    
    now_ts = time.time()
    
    # Check cache
    cached = MOROCCAN_CACHE.get(symbol)
    if cached and (now_ts - cached['last_fetch'] < CACHE_DURATION):
        return cached['price'], cached['change']

    try:
        url = f"https://www.casablancabourse.com/{target_ticker}/action/capitalisation/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Verify=False to avoid SSL errors with some setups
        response = requests.get(url, headers=headers, timeout=10, verify=False)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract Price: Look for "Prix de l'action" -> parent -> previous sibling
        price = 0.0
        label = soup.find(string=lambda t: "Prix de l'action" in str(t) if t else False)
        if label:
            parent = label.parent
            prev = parent.find_previous_sibling("div")
            if prev:
                # Text like "109.10 DH"
                text = prev.get_text(strip=True).replace("DH", "").replace(" ", "").replace(",", ".")
                price = float(text)

        # Extract Change: Look for "Change (1 jour)" -> parent -> previous sibling
        change_percent = 0.0
        change_label = soup.find(string=lambda t: "Change (1 jour)" in str(t) if t else False)
        if change_label:
            parent = change_label.parent
            prev = parent.find_previous_sibling("div")
            if prev:
                # Text like "-1.76 %"
                text = prev.get_text(strip=True).replace("%", "").replace(" ", "").replace(",", ".")
                change_percent = float(text)
        
        if price > 0:
            MOROCCAN_CACHE[symbol] = {
                'price': price,
                'change': change_percent,
                'last_fetch': now_ts
            }
            return price, change_percent
        else:
            raise ValueError(f"Could not parse price for {symbol}")

    except Exception as e:
        print(f"Error scraping Casablanca Bourse for {symbol}: {e}")
        # Fallback to cache if available even if expired
        if cached:
            return cached['price'], cached['change']
        raise e

def get_live_price(symbol: str) -> float:
    """
    Public helper to get the current price of a symbol.
    Returns 0.0 if failed.
    """
    try:
        if symbol in {"IAM.PA", "ATW.PA"}:
            price, _ = _get_casablanca_price(symbol)
        else:
            price, _ = _get_international_price(symbol)
        return price
    except Exception:
        return 0.0

@market_bp.route("/price/<symbol>", methods=["GET"])
def get_price(symbol: str):
    try:
        if symbol in {"IAM.PA", "ATW.PA"}:
            price, change_percent = _get_casablanca_price(symbol)
        else:
            price, change_percent = _get_international_price(symbol)
    except Exception as exc:
        return jsonify({"message": "Unable to fetch market price.", "error": str(exc)}), 502

    now = datetime.now(timezone.utc)
    return jsonify(
        {
            "symbol": symbol,
            "price": price,
            "changePercent": change_percent,
            "timestamp": int(now.timestamp()),
        }
    )


import random

@market_bp.route("/chart/<symbol>", methods=["GET"])
def get_chart_data(symbol: str):
    try:
        # Moroccan Stocks
        if symbol in {"IAM.PA", "ATW.PA"}:
            # Since we don't have historical data source for Moroccan stocks yet,
            # we'll return a single candle based on current price to initialize.
            # Frontend will accumulate real-time updates.
            price, _ = _get_casablanca_price(symbol)
            now = int(datetime.now(timezone.utc).timestamp())
            
            # Generate 100 fake candles for the last ~8 hours (5 min interval)
            # Generated BACKWARDS from current price to ensure smoothness
            chart_data = []
            volatility = 0.002 # 0.2% volatility per candle
            
            current_close = price
            
            # We generate from newest to oldest, then reverse
            for i in range(100):
                t = now - i * 300
                
                # Random movement
                change_percent = (random.random() - 0.5) * volatility
                open_p = current_close / (1 + change_percent)
                
                # High/Low logic
                high_p = max(open_p, current_close) * (1 + random.random() * volatility * 0.5)
                low_p = min(open_p, current_close) * (1 - random.random() * volatility * 0.5)
                
                chart_data.append({
                    "time": t,
                    "open": float(f"{open_p:.2f}"),
                    "high": float(f"{high_p:.2f}"),
                    "low": float(f"{low_p:.2f}"),
                    "close": float(f"{current_close:.2f}")
                })
                
                # Next candle's close (which is this candle's open)
                current_close = open_p

            # Reverse to get chronological order
            chart_data.reverse()
            return jsonify(chart_data)

        # International Stocks
        ticker = yf.Ticker(symbol)
        # Fetch 1 day of 1-minute intervals for "Professional Live" look
        df = ticker.history(period="1d", interval="1m", auto_adjust=True)
        
        # Fallback if intraday is empty
        if df.empty:
            df = ticker.history(period="5d", interval="5m", auto_adjust=True)

        chart_data = []
        for index, row in df.iterrows():
            # index is the timestamp
            ts = int(index.timestamp())
            chart_data.append({
                "time": ts,
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"])
            })

        return jsonify(chart_data)

    except Exception as e:
        return jsonify({"message": "Unable to fetch chart data.", "error": str(e)}), 500


@market_bp.route("/signal/<symbol>", methods=["GET"])
def get_ai_signal(symbol: str):
    try:
        # Mock signal for Moroccan stocks or if data fails
        if symbol in {"IAM.PA", "ATW.PA"}:
            return jsonify({
                "signal": "HOLD",
                "confidence": 50,
                "reasonKey": "ai_signal_hold_reason" 
            })

        # Fetch data for Technical Analysis
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1mo", interval="1d")
        
        if len(df) < 15:
             return jsonify({
                "signal": "HOLD",
                "confidence": 50,
                "reasonKey": "ai_signal_insufficient_data" 
            })

        # Calculate RSI (14)
        delta = df["Close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        current_rsi = rsi.iloc[-1]
        
        # Determine Signal
        if current_rsi < 30:
            signal = "BUY"
            confidence = min(int((30 - current_rsi) * 2 + 60), 95) # 30->60%, 10->100%
            reason_key = "ai_signal_rsi_oversold"
        elif current_rsi > 70:
            signal = "SELL"
            confidence = min(int((current_rsi - 70) * 2 + 60), 95)
            reason_key = "ai_signal_rsi_overbought"
        else:
            signal = "HOLD"
            confidence = int(100 - abs(50 - current_rsi)) # 50 -> 100%, 30/70 -> 80%
            reason_key = "ai_signal_rsi_neutral"

        return jsonify({
            "signal": signal,
            "confidence": confidence,
            "reasonKey": reason_key
        })

    except Exception as e:
        print(f"Signal error: {e}")
        return jsonify({
            "signal": "HOLD",
            "confidence": 50,
            "reasonKey": "ai_signal_error_fallback"
        })

