import requests
import time

BASE_URL = "http://127.0.0.1:5000/api"

def run():
    # 1. Register/Login User
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    
    print(f"Registering {email}...")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": password
    })
    
    if res.status_code == 201 or res.status_code == 400:
        # Login
        print("Logging in...")
        res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        if not res.ok:
            print(f"Login failed: {res.text}")
            return
        token = res.json()["token"]
        print("Logged in.")
    else:
        print(f"Registration failed: {res.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Challenge (if needed)
    print("Checking challenge...")
    res = requests.get(f"{BASE_URL}/challenge/current", headers=headers)
    challenge_id = None
    
    if res.ok:
        data = res.json()
        if data.get("challenge"):
            challenge_id = data["challenge"]["id"]
            print(f"Found existing challenge {challenge_id}")
    
    if not challenge_id:
        print("Creating challenge...")
        res = requests.post(f"{BASE_URL}/challenge/start", headers=headers, json={
            "planName": "Standard",
            "startingBalance": 5000
        })
        if res.ok:
            challenge_id = res.json()["challenge"]["id"]
            print(f"Created challenge {challenge_id}")
        else:
            print(f"Create challenge failed: {res.text}")
            return

    # 3. Execute Trade
    print("Executing BUY trade...")
    res = requests.post(f"{BASE_URL}/trade/execute", headers=headers, json={
        "challengeId": challenge_id,
        "symbol": "BTC-USD",
        "side": "BUY",
        "quantity": 0.1,
        "price": 50000,
        "pnl": 0
    })
    
    print(f"Trade Status: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    run()
