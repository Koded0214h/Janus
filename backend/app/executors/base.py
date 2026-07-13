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

    @abstractmethod
    def find_by_reference(self, reference: str) -> TransferResult | None:
        """Look up a previously-initiated transfer by the deterministic reference passed to
        execute() (Janus always sends the idempotency_key as that reference). Returns None if
        the rail has no record of it at all — safe to call execute() fresh in that case.

        This exists to close the Janus-to-rail dual write: execute() can succeed at the rail
        and then the process can die before the local receipt is persisted. A naive retry
        would either double-pay (if it blindly re-executes) or silently lose the receipt (if
        it just shrugs at the missing local row). Every executor must be able to answer
        "what actually happened at the rail for this reference" before either of those, not
        assume based on local state alone."""
        ...
