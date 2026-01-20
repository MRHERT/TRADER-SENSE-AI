import requests

BASE_URL = "http://127.0.0.1:5000/api"

def test_trade():
    # 1. Login
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "yassine.blog1@gmail.com",
        "password": "SSS123"
    })
    
    if resp.status_code != 200:
        print("Login failed:", resp.text)
        return
    
    token = resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Get active challenge
    print("Getting challenge...")
    # First, try to start one if not exists, but let's check current first
    # API for current challenge isn't explicitly in my memory, but let's try starting one
    # Or get history to see if we have one.
    # From routes/trade.py: challenge = Challenge.query.filter_by(user_id=user_id, status="ACTIVE").first()
    # There isn't a direct "get current challenge" endpoint shown in snippets, 
    # but let's try to start one to ensure we have one.
    
    start_resp = requests.post(f"{BASE_URL}/challenge/start", headers=headers, json={"planName": "Starter"})
    if start_resp.status_code == 201:
        challenge_id = start_resp.json()["challenge"]["id"]
        print(f"Started new challenge: {challenge_id}")
    elif start_resp.status_code == 400 and "already have" in start_resp.text:
        print("Challenge already active.")
        # We need to find the ID. 
        # trade/history?challengeId=... 
        # But wait, trade/history without ID gets the active one?
        # trade.py:35: challenge = Challenge.query.filter_by(user_id=user_id, status="ACTIVE")...
        # So let's hit trade/history to get a clue or we can't easily get the ID without an endpoint.
        # Actually, let's look at Navbar.tsx: fetch(`${API_BASE}/api/challenge/current`)
        # Ah, I missed that endpoint in my search.
        curr_resp = requests.get(f"{BASE_URL}/challenge/current", headers=headers)
        if curr_resp.status_code == 200:
            challenge_id = curr_resp.json()["challenge"]["id"]
            print(f"Found active challenge: {challenge_id}")
        else:
            print("Could not find active challenge:", curr_resp.text)
            return
    else:
        print("Start challenge failed:", start_resp.text)
        return

    # 3. Execute Trade
    print("Executing trade...")
    trade_payload = {
        "challengeId": challenge_id,
        "symbol": "AAPL",
        "side": "BUY",
        "quantity": 1,
        "price": 150.0,
        "pnl": 0,
        "orderType": "MARKET"
    }
    
    trade_resp = requests.post(f"{BASE_URL}/trade/execute", headers=headers, json=trade_payload)
    print("Trade Response Code:", trade_resp.status_code)
    print("Trade Response Body:", trade_resp.text)

if __name__ == "__main__":
    try:
        test_trade()
    except Exception as e:
        print("Exception:", e)
