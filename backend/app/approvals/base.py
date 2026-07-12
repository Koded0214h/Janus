"""The approval channel boundary. Swapping channels (email -> Telegram, Slack, SMS, ...)
means writing a new class here — the approval service and /intents flow never change."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

from app.domain import PaymentIntent


@dataclass(frozen=True)
class ApprovalRequest:
    token: str
    intent: PaymentIntent
    decision_reason: str
    review_url: str
    """A GET, non-mutating confirmation page with Approve/Deny buttons — deliberately not a
    direct-action link, since email clients and security scanners auto-prefetch GET links."""
    expires_at: datetime


class ApprovalChannel(ABC):
    name: str

    @abstractmethod
    def notify(self, request: ApprovalRequest) -> None: ...
