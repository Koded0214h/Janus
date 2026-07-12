"""Typed mirrors of the JSON shapes documented in backend/README.md and PRD.md §8/§10.

Kept as plain dataclasses, not pydantic — the whole point of this SDK is to add as little
weight as possible on top of the raw HTTP API. httpx is the only real dependency.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

Status = Literal["allowed", "denied", "needs_approval"]


@dataclass(frozen=True)
class Receipt:
    rail: str
    rail_reference: str | None
    amount_ngn: Decimal
    status: str


@dataclass(frozen=True)
class Decision:
    id: str
    status: Status
    reason: str
    policy_version: int
    evaluated_at: datetime
    is_replay: bool
    remaining_daily_ngn: Decimal
    receipt: Receipt | None
    approval_url: str | None
    expires_at: datetime | None

    @property
    def allowed(self) -> bool:
        """True only for "allowed". "needs_approval" never reaches you here — pay() already
        blocked until a human resolved it, so this is always a final answer."""
        return self.status == "allowed"


@dataclass(frozen=True)
class Policy:
    version: int
    daily_cap_ngn: Decimal
    per_tx_cap_ngn: Decimal
    approval_threshold_ngn: Decimal
    allowed_categories: list[str]
    allowed_recipients: list[str]
    velocity_limit_count: int
    velocity_window_seconds: int


@dataclass(frozen=True)
class AuditEntry:
    intent_id: int
    idempotency_key: str
    amount_ngn: Decimal
    recipient: str
    category: str
    reason: str
    received_at: datetime
    verdict: Literal["allow", "deny", "needs_approval"]
    """Note: present-tense and un-suffixed ("allow"/"deny"), unlike Decision.status
    ("allowed"/"denied") — this is the raw internal decision-engine verdict, not the wire
    contract from §8. The audit log is a debugging/read view, kept as the engine sees it."""
    decision_reason: str
    policy_version: int
    evaluated_at: datetime
    transfer_reference: str | None
    transfer_status: str | None


def _decimal(value: Any) -> Decimal:
    return Decimal(str(value))


def _optional_decimal(value: Any) -> Decimal | None:
    return None if value is None else _decimal(value)


def _datetime(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _optional_datetime(value: str | None) -> datetime | None:
    return None if value is None else _datetime(value)


def receipt_from_json(data: dict[str, Any] | None) -> Receipt | None:
    if data is None:
        return None
    return Receipt(
        rail=data["rail"],
        rail_reference=data["rail_reference"],
        amount_ngn=_decimal(data["amount_ngn"]),
        status=data["status"],
    )


def decision_from_json(data: dict[str, Any]) -> Decision:
    return Decision(
        id=data["id"],
        status=data["status"],
        reason=data["reason"],
        policy_version=data["policy_version"],
        evaluated_at=_datetime(data["evaluated_at"]),
        is_replay=data["is_replay"],
        remaining_daily_ngn=_decimal(data["remaining_daily_ngn"]),
        receipt=receipt_from_json(data.get("receipt")),
        approval_url=data.get("approval_url"),
        expires_at=_optional_datetime(data.get("expires_at")),
    )


def policy_from_json(data: dict[str, Any]) -> Policy:
    return Policy(
        version=data["version"],
        daily_cap_ngn=_decimal(data["daily_cap_ngn"]),
        per_tx_cap_ngn=_decimal(data["per_tx_cap_ngn"]),
        approval_threshold_ngn=_decimal(data["approval_threshold_ngn"]),
        allowed_categories=list(data["allowed_categories"]),
        allowed_recipients=list(data["allowed_recipients"]),
        velocity_limit_count=data["velocity_limit_count"],
        velocity_window_seconds=data["velocity_window_seconds"],
    )


def audit_entry_from_json(data: dict[str, Any]) -> AuditEntry:
    return AuditEntry(
        intent_id=data["intent_id"],
        idempotency_key=data["idempotency_key"],
        amount_ngn=_decimal(data["amount_ngn"]),
        recipient=data["recipient"],
        category=data["category"],
        reason=data["reason"],
        received_at=_datetime(data["received_at"]),
        verdict=data["verdict"],
        decision_reason=data["decision_reason"],
        policy_version=data["policy_version"],
        evaluated_at=_datetime(data["evaluated_at"]),
        transfer_reference=data.get("transfer_reference"),
        transfer_status=data.get("transfer_status"),
    )
