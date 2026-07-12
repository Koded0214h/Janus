"""The Janus client. One class, four calls — mirrors the four routes in backend/README.md."""

from __future__ import annotations

import uuid
from decimal import Decimal
from types import TracebackType

import httpx

from janus_sdk.exceptions import JanusAPIError, JanusAuthError
from janus_sdk.models import (
    AuditEntry,
    Decision,
    Policy,
    audit_entry_from_json,
    decision_from_json,
    policy_from_json,
)

# A needs_approval decision blocks server-side for up to APPROVAL_TIMEOUT_SECONDS (default
# 300s in the backend) before it gives up. This client's timeout must not give up first.
DEFAULT_TIMEOUT_SECONDS = 310.0


class Janus:
    """
    with Janus(base_url="http://localhost:8000", api_key="...") as janus:
        decision = janus.pay(amount_ngn=150, recipient="rider_1", category="delivery",
                              reason="delivery fee")
        if decision.allowed:
            ...
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_key: str = "",
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
        transport: httpx.BaseTransport | None = None,
    ):
        if not api_key:
            raise ValueError("api_key is required — every Janus route except /health needs it")
        self._client = httpx.Client(
            base_url=base_url, timeout=timeout, headers={"X-API-Key": api_key}, transport=transport
        )

    def pay(
        self,
        amount_ngn: Decimal | float | str,
        recipient: str,
        category: str,
        reason: str,
        idempotency_key: str | None = None,
    ) -> Decision:
        """Submit a payment intent. Blocks until Janus reaches a final answer — if the amount
        needed human sign-off, this call already waited for that, so decision.status is always
        "allowed" or "denied" here, never a dangling "needs_approval".

        idempotency_key defaults to a fresh UUID if you don't pass one, which is fine for a
        one-off call but defeats the point of idempotency for retries — if you're retrying a
        real payment attempt after a timeout or network error, pass the *same* idempotency_key
        each time so Janus can tell it's the same attempt and never pays twice.
        """
        response = self._client.post(
            "/intents",
            json={
                "amount_ngn": str(amount_ngn),
                "recipient": recipient,
                "category": category,
                "reason": reason,
                "idempotency_key": idempotency_key or str(uuid.uuid4()),
            },
        )
        self._raise_for_status(response)
        return decision_from_json(response.json())

    def get_policy(self) -> Policy:
        response = self._client.get("/policy")
        self._raise_for_status(response)
        return policy_from_json(response.json())

    def set_policy(
        self,
        *,
        daily_cap_ngn: Decimal | float | str,
        per_tx_cap_ngn: Decimal | float | str,
        approval_threshold_ngn: Decimal | float | str,
        allowed_categories: list[str],
        allowed_recipients: list[str],
        velocity_limit_count: int,
        velocity_window_seconds: int,
    ) -> Policy:
        """Creates a new policy version and retires the previous one — never an in-place
        update. Takes effect immediately for the next intent submitted."""
        response = self._client.post(
            "/policy",
            json={
                "daily_cap_ngn": str(daily_cap_ngn),
                "per_tx_cap_ngn": str(per_tx_cap_ngn),
                "approval_threshold_ngn": str(approval_threshold_ngn),
                "allowed_categories": allowed_categories,
                "allowed_recipients": allowed_recipients,
                "velocity_limit_count": velocity_limit_count,
                "velocity_window_seconds": velocity_window_seconds,
            },
        )
        self._raise_for_status(response)
        return policy_from_json(response.json())

    def get_audit(self, limit: int = 100) -> list[AuditEntry]:
        response = self._client.get("/audit", params={"limit": limit})
        self._raise_for_status(response)
        return [audit_entry_from_json(row) for row in response.json()]

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> Janus:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()

    @staticmethod
    def _raise_for_status(response: httpx.Response) -> None:
        if response.status_code == 401:
            raise JanusAuthError("invalid or missing API key")
        if response.status_code >= 400:
            raise JanusAPIError(response.status_code, response.text)
