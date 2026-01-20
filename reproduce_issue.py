import requests

BASE_URL = "http://127.0.0.1:5000/api"

def reproduce_issue():
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
    curr_resp = requests.get(f"{BASE_URL}/challenge/current", headers=headers)
    
    challenge_id = None
    if curr_resp.status_code == 200:
        data = curr_resp.json()
        if data.get("challenge"):
            challenge_id = data["challenge"]["id"]
            print(f"Found active challenge: {challenge_id}")
            print(f"Initial Balance: {data['challenge']['currentBalance']}")
        else:
            print("No active challenge found.")
    
    if not challenge_id:
        print("Starting new challenge...")
        start_resp = requests.post(f"{BASE_URL}/challenge/start", headers=headers, json={"planName": "Starter"})
        if start_resp.status_code == 201:
            challenge_id = start_resp.json()["challenge"]["id"]
            print(f"Started new challenge: {challenge_id}")
        else:
            print("Start challenge failed:", start_resp.text)
            return

    # 3. Check Balance before trade
    pf_resp = requests.get(f"{BASE_URL}/trade/portfolio?challengeId={challenge_id}", headers=headers)
    initial_balance = pf_resp.json()["cashBalance"]
    print(f"Balance BEFORE BUY: {initial_balance}")

    # 4. BUY 10 units at $400 (Cost $4000)
    print("Executing BUY trade...")
    buy_payload = {
        "challengeId": challenge_id,
        "symbol": "TEST-BTC",
        "side": "BUY",
        "quantity": 10,
        "price": 400.0,
        "pnl": 0,
        "orderType": "MARKET"
    }
    
    buy_resp = requests.post(f"{BASE_URL}/trade/execute", headers=headers, json=buy_payload)
    if buy_resp.status_code != 201:
        print("Buy failed:", buy_resp.text)
        return
    
    # 5. Check Balance after BUY
    pf_resp = requests.get(f"{BASE_URL}/trade/portfolio?challengeId={challenge_id}", headers=headers)
    after_buy_balance = pf_resp.json()["cashBalance"]
    print(f"Balance AFTER BUY (Expected {initial_balance - 4000}): {after_buy_balance}")

    # 6. SELL 10 units at $500 (Value $5000)
    print("Executing SELL trade...")
    sell_payload = {
        "challengeId": challenge_id,
        "symbol": "TEST-BTC",
        "side": "SELL",
        "quantity": 10,
        "price": 500.0,
        "pnl": 0,
        "orderType": "MARKET"
    }
    
    sell_resp = requests.post(f"{BASE_URL}/trade/execute", headers=headers, json=sell_payload)
    if sell_resp.status_code != 201:
        print("Sell failed:", sell_resp.text)
        return

    # 7. Check Balance after SELL
    pf_resp = requests.get(f"{BASE_URL}/trade/portfolio?challengeId={challenge_id}", headers=headers)
    final_balance = pf_resp.json()["cashBalance"]
    expected_final = after_buy_balance + 5000
    print(f"Balance AFTER SELL (Expected {expected_final}): {final_balance}")

if __name__ == "__main__":
    try:
        reproduce_issue()
    except Exception as e:
        print("Exception:", e)
