import httpx

from app.config import Settings
from app.domain import PaymentIntent
from app.executors.base import Executor, TransferResult
from app.recipients import RecipientDetails, get_recipient


class PaystackError(Exception):
    pass


class PaystackExecutor(Executor):
    """Test mode by default — pass a sk_test_ key. Live mode is the same code with a sk_live_ key."""

    def __init__(self, settings: Settings, client: httpx.Client | None = None):
        self._settings = settings
        self._client = client or httpx.Client(
            base_url=settings.paystack_base_url,
            headers={"Authorization": f"Bearer {settings.paystack_secret_key}"},
            timeout=15.0,
        )
        self._recipient_code_cache: dict[str, str] = {}

    def execute(self, intent: PaymentIntent) -> TransferResult:
        recipient = get_recipient(intent.recipient)
        if recipient is None:
            return TransferResult(
                success=False,
                rail="paystack",
                reference=None,
                status="failed",
                raw_message=f"no bank details on file for recipient '{intent.recipient}'",
            )

        try:
            recipient_code = self._resolve_recipient_code(intent.recipient, recipient)
            return self._initiate_transfer(intent, recipient_code)
        except PaystackError as exc:
            return TransferResult(
                success=False, rail="paystack", reference=None, status="failed", raw_message=str(exc)
            )

    def _resolve_recipient_code(self, recipient_id: str, recipient: RecipientDetails) -> str:
        """Cached per (executor instance, recipient) — avoids re-registering the same
        bank account with Paystack on every single transfer."""
        cached = self._recipient_code_cache.get(recipient_id)
        if cached is not None:
            return cached
        code = _create_transfer_recipient(self._client, recipient)
        self._recipient_code_cache[recipient_id] = code
        return code

    def _initiate_transfer(self, intent: PaymentIntent, recipient_code: str) -> TransferResult:
        amount_kobo = int(intent.amount_ngn * 100)
        response = self._client.post(
            "/transfer",
            json={
                "source": "balance",
                "amount": amount_kobo,
                "recipient": recipient_code,
                "reason": intent.reason,
                "reference": intent.idempotency_key,
            },
        )
        body = response.json()
        if response.status_code >= 400 or not body.get("status"):
            raise PaystackError(body.get("message", f"transfer failed with HTTP {response.status_code}"))

        data = body["data"]
        return TransferResult(
            success=True,
            rail="paystack",
            # transfer_code, not data["reference"] — the latter just echoes back the
            # idempotency_key we sent. transfer_code is Paystack's own identifier, and it's
            # what /transfer/finalize_transfer and /transfer/:id_or_code actually need.
            reference=data.get("transfer_code") or intent.idempotency_key,
            status=data.get("status", "unknown"),
            raw_message=body.get("message", ""),
        )

    def find_by_reference(self, reference: str) -> TransferResult | None:
        """GET /transfer?reference=X — empirically verified to filter server-side (confirmed
        live: a nonexistent reference returns an empty list, a real one returns exactly that
        transfer), not just accept-and-ignore the param. This is the reconciliation path: if
        Janus crashed between initiating a transfer and persisting the local receipt, this is
        how a retry finds out what actually happened at Paystack instead of guessing."""
        response = self._client.get("/transfer", params={"reference": reference})
        body = response.json()
        if response.status_code >= 400 or not body.get("status") or not body.get("data"):
            return None

        data = body["data"][0]
        return TransferResult(
            success=True,
            rail="paystack",
            reference=data.get("transfer_code") or reference,
            status=data.get("status", "unknown"),
            raw_message="reconciled from Paystack transfer history",
        )

    def finalize_transfer(self, transfer_code: str, otp: str) -> TransferResult:
        """Completes a transfer stuck in "otp" state — needed when the receiving Paystack
        account has OTP-for-transfers enabled. This is an account security setting on
        Paystack's side, not something Janus's decision engine or ledger has any say over;
        by the time this is called, the payment was already authorized and the budget
        already spent — this only finishes settling money that's already been committed to."""
        response = self._client.post("/transfer/finalize_transfer", json={"transfer_code": transfer_code, "otp": otp})
        body = response.json()
        if response.status_code >= 400 or not body.get("status"):
            return TransferResult(
                success=False,
                rail="paystack",
                reference=transfer_code,
                status="failed",
                raw_message=body.get("message", f"finalize failed with HTTP {response.status_code}"),
            )

        data = body["data"]
        return TransferResult(
            success=True,
            rail="paystack",
            reference=data.get("transfer_code", transfer_code),
            status=data.get("status", "unknown"),
            raw_message=body.get("message", ""),
        )


def _create_transfer_recipient(client: httpx.Client, recipient: RecipientDetails) -> str:
    response = client.post(
        "/transferrecipient",
        json={
            "type": "nuban",
            "name": recipient.name,
            "account_number": recipient.account_number,
            "bank_code": recipient.bank_code,
            "currency": "NGN",
        },
    )
    body = response.json()
    if response.status_code >= 400 or not body.get("status"):
        raise PaystackError(body.get("message", f"recipient creation failed with HTTP {response.status_code}"))
    return body["data"]["recipient_code"]
