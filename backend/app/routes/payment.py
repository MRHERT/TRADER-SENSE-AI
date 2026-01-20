from flask import Blueprint, jsonify, redirect, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import Challenge, Payment, PayPalConfig

import requests

payment_bp = Blueprint("payment", __name__)



def _get_current_user_id():
    identity = get_jwt_identity()
    return int(identity) if identity is not None else None


def _get_paypal_api_base(config: PayPalConfig) -> str:
    mode = (config.mode or "").lower()
    if mode == "live":
        return "https://api-m.paypal.com"
    return "https://api-m.sandbox.paypal.com"


def _get_paypal_access_token(config: PayPalConfig) -> str:
    base = _get_paypal_api_base(config)
    response = requests.post(
        f"{base}/v1/oauth2/token",
        data={"grant_type": "client_credentials"},
        auth=(config.client_id, config.client_secret),
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    token = data.get("access_token")
    if not token:
        raise RuntimeError("Missing PayPal access token")
    return token


def _create_paypal_order(
    config: PayPalConfig,
    user_id: int,
    plan_name: str,
    amount: float,
    currency_code: str,
    return_url: str,
    cancel_url: str,
):
    base = _get_paypal_api_base(config)
    access_token = _get_paypal_access_token(config)
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    custom_id = f"user:{user_id}|plan:{plan_name}"
    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": currency_code,
                    "value": f"{amount:.2f}",
                },
                "custom_id": custom_id,
                "description": plan_name,
            }
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }
    response = requests.post(
        f"{base}/v2/checkout/orders",
        json=body,
        headers=headers,
        timeout=10,
    )
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        try:
            error_data = response.json()
        except ValueError:
            error_data = {"raw": response.text}
        raise RuntimeError(f"PayPal order error: {error_data}") from exc
    data = response.json()
    approval_url = None
    for link in data.get("links") or []:
        if link.get("rel") == "approve":
            approval_url = link.get("href")
            break
    order_id = data.get("id")
    if not order_id or not approval_url:
        raise RuntimeError("Failed to create PayPal order")
    return order_id, approval_url


@payment_bp.route("/create", methods=["POST"])
@jwt_required()
def create_payment():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    plan_name = (data.get("planName") or "").strip()
    amount = float(data.get("amount") or 0)
    currency = (data.get("currency") or "DH").upper()

    if not plan_name or amount <= 0:
        return jsonify({"message": "planName and positive amount are required."}), 400

    payment = Payment(
        user_id=user_id,
        plan_name=plan_name,
        amount=amount,
        currency=currency,
        status="completed",
    )
    db.session.add(payment)
    db.session.commit()

    payload = {
        "id": payment.id,
        "planName": payment.plan_name,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
    }

    return jsonify({"payment": payload}), 201


@payment_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    plan_name = (data.get("planName") or "").strip()
    amount = float(data.get("amount") or 0)
    currency = (data.get("currency") or "DH").upper()
    method = (data.get("method") or "").strip()

    if not plan_name or amount <= 0:
        return jsonify({"message": "planName and positive amount are required."}), 400

    existing = Challenge.query.filter_by(user_id=user_id).first()
    if existing:
        return (
            jsonify({"message": "You already have a challenge (Active, Passed, or Failed). One challenge limit per user."}),
            400,
        )

    # All challenges now start with the same virtual balance,
    # regardless of selected plan. The difference between plans
    # is the funded capital after passing the challenge.
    starting_balance = 5000.0

    if method == "PayPal":
        config = PayPalConfig.query.first()
        if not config:
            return jsonify({"message": "PayPal is not configured by the admin."}), 400

        if (config.mode or "").lower() == "sandbox":
            paypal_currency = "USD"
        else:
            paypal_currency = "MAD" if currency == "DH" else currency
        base_url = request.host_url.rstrip("/")
        success_url = f"{base_url}/api/payment/paypal/success"
        cancel_url = f"{base_url}/api/payment/paypal/cancel"

        try:
            order_id, approval_url = _create_paypal_order(
                config=config,
                user_id=user_id,
                plan_name=plan_name,
                amount=amount,
                currency_code=paypal_currency,
                return_url=success_url,
                cancel_url=cancel_url,
            )
        except Exception as exc:
            return (
                jsonify(
                    {
                        "message": "Unable to initialize PayPal payment.",
                        "error": str(exc),
                    }
                ),
                502,
            )

        return jsonify(
            {
                "message": "PayPal order created.",
                "paypal": {
                    "orderId": order_id,
                    "approvalUrl": approval_url,
                },
            }
        )

    payment = Payment(
        user_id=user_id,
        plan_name=plan_name,
        amount=amount,
        currency=currency,
        status="completed",
    )
    db.session.add(payment)

    challenge = Challenge(
        user_id=user_id,
        plan_name=plan_name,
        status="ACTIVE",
        starting_balance=starting_balance,
        current_balance=starting_balance,
        current_equity=starting_balance,
        profit_target=10.0,
        max_daily_loss_pct=5.0,
        max_total_loss_pct=10.0,
    )
    db.session.add(challenge)

    db.session.commit()

    challenge_payload = {
        "id": challenge.id,
        "status": challenge.status,
        "planName": challenge.plan_name,
        "startingBalance": challenge.starting_balance,
        "currentBalance": challenge.current_balance,
        "currentEquity": challenge.current_equity,
        "profitTarget": challenge.profit_target,
        "dailyLossLimit": challenge.max_daily_loss_pct,
        "totalLossLimit": challenge.max_total_loss_pct,
    }

    return jsonify(
        {
            "message": "Payment successful, challenge started.",
            "challenge": challenge_payload,
        }
    ), 201


@payment_bp.route("/history", methods=["GET"])
@jwt_required()
def payment_history():
    user_id = _get_current_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    payments = (
        Payment.query.filter_by(user_id=user_id)
        .order_by(Payment.created_at.desc())
        .all()
    )

    payload = [
        {
            "id": p.id,
            "planName": p.plan_name,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
        }
        for p in payments
    ]

    return jsonify({"payments": payload})


@payment_bp.route("/paypal/success", methods=["GET"])
def paypal_success():
    token = (request.args.get("token") or "").strip()
    if not token:
        return redirect("/dashboard")

    config = PayPalConfig.query.first()
    if not config:
        return redirect("/dashboard")

    try:
        access_token = _get_paypal_access_token(config)
        base = _get_paypal_api_base(config)
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        response = requests.post(
            f"{base}/v2/checkout/orders/{token}/capture",
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
    except Exception:
        return redirect("/dashboard")

    if data.get("status") != "COMPLETED":
        return redirect("/dashboard")

    purchase_units = data.get("purchase_units") or []
    if not purchase_units:
        return redirect("/dashboard")

    unit = purchase_units[0]
    custom_id = (unit.get("custom_id") or "").strip()
    amount_info = unit.get("amount") or {}
    amount_value = float(amount_info.get("value") or 0)

    user_id = None
    plan_name = None
    for part in custom_id.split("|"):
        if part.startswith("user:"):
            raw = part.split(":", 1)[1]
            try:
                user_id = int(raw)
            except ValueError:
                user_id = None
        elif part.startswith("plan:"):
            plan_name = part.split(":", 1)[1]

    if not user_id or not plan_name:
        return redirect("/dashboard")

    existing = Challenge.query.filter_by(user_id=user_id, status="ACTIVE").first()
    if existing:
        return redirect("/dashboard")

    if plan_name == "Starter":
        starting_balance = 5000.0
    elif plan_name == "Pro":
        starting_balance = 25000.0
    elif plan_name == "Elite":
        starting_balance = 50000.0
    else:
        starting_balance = 5000.0

    payment = Payment(
        user_id=user_id,
        plan_name=plan_name,
        amount=amount_value,
        currency="DH",
        status="completed",
    )
    db.session.add(payment)

    challenge = Challenge(
        user_id=user_id,
        plan_name=plan_name,
        status="ACTIVE",
        starting_balance=starting_balance,
        current_balance=starting_balance,
        current_equity=starting_balance,
        profit_target=10.0,
        max_daily_loss_pct=5.0,
        max_total_loss_pct=10.0,
    )
    db.session.add(challenge)

    db.session.commit()

    return redirect("/dashboard")


@payment_bp.route("/paypal/cancel", methods=["GET"])
def paypal_cancel():
    return redirect("/challenges")
