from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

from app.domain import Verdict

# Wire contract per PRD §8 — deliberately worded differently from the internal Verdict
# enum (allow/deny) so the domain layer stays decoupled from the API's past-tense phrasing.
Status = Literal["allowed", "denied", "needs_approval"]

_STATUS_BY_VERDICT: dict[Verdict, Status] = {
    Verdict.ALLOW: "allowed",
    Verdict.DENY: "denied",
    Verdict.NEEDS_APPROVAL: "needs_approval",
}


def status_for(verdict: Verdict) -> Status:
    return _STATUS_BY_VERDICT[verdict]


class IntentRequest(BaseModel):
    amount_ngn: Decimal = Field(gt=0)
    recipient: str
    category: str
    reason: str
    idempotency_key: str = Field(min_length=1, max_length=255)


class Receipt(BaseModel):
    rail: str
    rail_reference: str | None
    amount_ngn: Decimal
    status: str


class DecisionResponse(BaseModel):
    id: str
    status: Status
    reason: str
    policy_version: int
    evaluated_at: datetime
    is_replay: bool
    remaining_daily_ngn: Decimal
    receipt: Receipt | None = None
    approval_url: str | None = None
    expires_at: datetime | None = None


class PolicyResponse(BaseModel):
    version: int
    daily_cap_ngn: Decimal
    per_tx_cap_ngn: Decimal
    approval_threshold_ngn: Decimal
    allowed_categories: list[str]
    allowed_recipients: list[str]
    velocity_limit_count: int
    velocity_window_seconds: int


class PolicyRequest(BaseModel):
    """Deliberately has no float_limit_ngn field — the float ceiling is independent of
    policy by design (PRD §7.3) and is never settable through this endpoint."""

    daily_cap_ngn: Decimal = Field(ge=0)
    per_tx_cap_ngn: Decimal = Field(ge=0)
    approval_threshold_ngn: Decimal = Field(ge=0)
    allowed_categories: list[str] = Field(default_factory=list)
    allowed_recipients: list[str] = Field(default_factory=list)
    velocity_limit_count: int = Field(ge=0)
    velocity_window_seconds: int = Field(gt=0)


class AuditEntry(BaseModel):
    intent_id: int
    idempotency_key: str
    amount_ngn: Decimal
    recipient: str
    category: str
    reason: str
    received_at: datetime
    verdict: Verdict
    decision_reason: str
    policy_version: int
    evaluated_at: datetime
    transfer_reference: str | None = None
    transfer_status: str | None = None
