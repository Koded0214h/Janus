from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.domain import Verdict


class IntentRequest(BaseModel):
    amount_ngn: Decimal = Field(gt=0)
    recipient: str
    category: str
    reason: str
    idempotency_key: str = Field(min_length=1, max_length=255)


class TransferInfo(BaseModel):
    reference: str | None
    status: str


class DecisionResponse(BaseModel):
    verdict: Verdict
    reason: str
    policy_version: int
    evaluated_at: datetime
    is_replay: bool
    transfer: TransferInfo | None = None


class PolicyResponse(BaseModel):
    version: int
    daily_cap_ngn: Decimal
    per_tx_cap_ngn: Decimal
    approval_threshold_ngn: Decimal
    allowed_categories: list[str]
    allowed_recipients: list[str]
    velocity_limit_count: int
    velocity_window_seconds: int


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
