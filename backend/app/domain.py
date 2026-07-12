"""Pure domain types shared by the decision engine, DB models, and API schemas.

No I/O lives here — just the shapes the rest of the system agrees on.
"""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal
from enum import StrEnum


class Verdict(StrEnum):
    ALLOW = "allow"
    DENY = "deny"
    NEEDS_APPROVAL = "needs_approval"


class ApprovalOutcome(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"
    EXPIRED = "expired"
    """Timed out without a reply — treated the same as DENIED by the caller (deny-on-timeout)."""


@dataclass(frozen=True)
class PaymentIntent:
    amount_ngn: Decimal
    recipient: str
    category: str
    reason: str
    idempotency_key: str


@dataclass(frozen=True)
class PolicyConfig:
    """One version of the user's policy. Immutable once created — changes create a new version."""

    version: int
    daily_cap_ngn: Decimal
    per_tx_cap_ngn: Decimal
    approval_threshold_ngn: Decimal
    allowed_categories: frozenset[str]
    allowed_recipients: frozenset[str]
    velocity_limit_count: int
    velocity_window_seconds: int


@dataclass(frozen=True)
class SpendState:
    """Current spend posture at evaluation time — read-only snapshot the engine decides against.

    Idempotency replay is handled by the ledger before the engine is ever called — a
    duplicate idempotency_key returns the stored decision, it never reaches evaluate().
    """

    daily_total_ngn: Decimal
    velocity_count: int
    float_total_ngn: Decimal
    """Cumulative amount ever disbursed against the standing float, independent of policy
    and never reset automatically — only when the operator tops up the funded float."""


@dataclass(frozen=True)
class Decision:
    verdict: Verdict
    reason: str
    policy_version: int
    evaluated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
