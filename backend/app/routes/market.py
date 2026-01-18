from datetime import datetime, timezone

import requests
import yfinance as yf
from bs4 import BeautifulSoup
from flask import Blueprint, jsonify

market_bp = Blueprint("market", __name__)


def _get_international_price(symbol: str) -> float:
  ticker = yf.Ticker(symbol)
  data = ticker.history(period="1d", interval="1m")
  if data.empty:
      raise ValueError("No market data")
  price = float(data["Close"].iloc[-1])
  return price


def _get_moroccan_price(symbol: str) -> float:
  code = symbol.split(".")[0]
  url = f"https://www.casablanca-bourse.com/bourseweb/Indications.aspx?code={code}&lang=fr"
  response = requests.get(url, timeout=8)
  response.raise_for_status()

  soup = BeautifulSoup(response.text, "html.parser")
  price_element = soup.select_one("span#ctl00_Contenu_PageContenu_ucIndications1_lblDernierCours")
  if not price_element:
      raise ValueError("Could not locate Moroccan price element")

  raw = price_element.text.strip().replace(" ", "").replace(",", ".")
  return float(raw)


@market_bp.route("/price/<symbol>", methods=["GET"])
def get_price(symbol: str):
  try:
      if symbol in {"IAM.PA", "ATW.PA"}:
          price = _get_moroccan_price(symbol)
      else:
          price = _get_international_price(symbol)
  except Exception as exc:
      return jsonify({"message": "Unable to fetch market price.", "error": str(exc)}), 502

  now = datetime.now(timezone.utc)
  return jsonify(
      {
          "symbol": symbol,
          "price": price,
          "timestamp": int(now.timestamp()),
      }
  )

