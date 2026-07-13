#!/usr/bin/env python3
"""Finalize a Paystack transfer stuck in "otp" state.

This happens when the receiving Paystack account has OTP-for-transfers enabled — an account
security setting, not something Janus's decision engine or ledger controls. By the time a
transfer reaches "otp", it was already authorized and the budget already committed; this
script only finishes settling money that's already been decided on, and updates our own
TransferModel row to match once Paystack confirms.

Run from backend/, with the venv active:
    python scripts/finalize_transfer.py --idempotency-key demo-1 --otp 123456
"""

import argparse
import sys
from datetime import UTC, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings  # noqa: E402
from app.db import SessionLocal  # noqa: E402
from app.executors.paystack import PaystackExecutor  # noqa: E402
from app.models import DecisionModel, IntentModel, TransferModel  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--idempotency-key", required=True, help="the idempotency_key of the intent to finalize")
    parser.add_argument("--otp", required=True, help="the one-time code Paystack sent the account owner")
    args = parser.parse_args()

    db = SessionLocal()
    intent = db.query(IntentModel).filter_by(idempotency_key=args.idempotency_key).one_or_none()
    if intent is None:
        print(f"No intent found for idempotency_key={args.idempotency_key!r}", file=sys.stderr)
        return 1

    decision = db.query(DecisionModel).filter_by(intent_id=intent.id).one_or_none()
    transfer = db.query(TransferModel).filter_by(decision_id=decision.id).one_or_none() if decision else None
    if transfer is None:
        print("That intent has no recorded transfer.", file=sys.stderr)
        return 1
    if transfer.status != "otp":
        print(f"Transfer status is {transfer.status!r}, not 'otp' — nothing to finalize.", file=sys.stderr)
        return 1

    executor = PaystackExecutor(get_settings())
    result = executor.finalize_transfer(transfer.rail_reference, args.otp)

    print(f"Paystack response: success={result.success} status={result.status} message={result.raw_message!r}")

    if result.success:
        transfer.status = result.status
        transfer.settled_at = datetime.now(UTC)
        db.commit()
        print(f"Updated local record: transfer for {args.idempotency_key!r} is now {result.status!r}.")

    return 0 if result.success else 1


if __name__ == "__main__":
    sys.exit(main())
