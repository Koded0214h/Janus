"""The executor boundary. Swapping rails (Paystack -> Flutterwave, Mono, Squad, ...)
means writing a new class here — the decision engine and ledger never change."""

from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.domain import PaymentIntent


@dataclass(frozen=True)
class TransferResult:
    success: bool
    rail: str
    reference: str | None
    status: str
    raw_message: str


class Executor(ABC):
    @abstractmethod
    def execute(self, intent: PaymentIntent) -> TransferResult: ...
