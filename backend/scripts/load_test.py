#!/usr/bin/env python3
"""The PRD §11 load test: fire overlapping intents against a shared budget through the real
running server and prove zero overspend and zero double-pays.

Run against a live server (see backend/README.md for how to start one):

    python scripts/load_test.py
    python scripts/load_test.py --base-url http://localhost:8000 --concurrency 30 --per-request-ngn 50

Assumes the active policy already allow-lists category "delivery" and recipient "rider_1"
(the same fixtures used throughout backend/README.md's "Try it" examples).
"""

import argparse
import os
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal

import httpx

RECIPIENT = "rider_1"
CATEGORY = "delivery"


def post_intent(client: httpx.Client, amount: Decimal, idempotency_key: str) -> dict:
    response = client.post(
        "/intents",
        json={
            "amount_ngn": str(amount),
            "recipient": RECIPIENT,
            "category": CATEGORY,
            "reason": "load test",
            "idempotency_key": idempotency_key,
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()


def fetch_policy(client: httpx.Client) -> dict:
    response = client.get("/policy", timeout=10.0)
    response.raise_for_status()
    return response.json()


def probe_remaining_budget(client: httpx.Client) -> Decimal:
    """A throwaway 1-naira intent, just to read a live remaining_daily_ngn value.
    It spends 1 naira itself — the caller's baseline already reflects that."""
    body = post_intent(client, Decimal("1"), f"load-test-probe-{uuid.uuid4()}")
    return Decimal(body["remaining_daily_ngn"])


def run_budget_test(client: httpx.Client, concurrency: int, per_request_ngn: Decimal) -> bool:
    print(f"\n=== Budget test: {concurrency} concurrent NGN {per_request_ngn} intents against a shared cap ===")
    remaining_before = probe_remaining_budget(client)
    upper_bound_allowed = int(remaining_before // per_request_ngn)
    print(f"Remaining daily budget after probe: NGN {remaining_before}")
    print(f"Upper bound on allowed requests (budget alone): {upper_bound_allowed} of {concurrency}")
    print("(the actual number may be lower still if velocity limits also bind — that's fine, we're proving no overspend, not a specific count)")

    keys = [f"load-test-budget-{uuid.uuid4()}" for _ in range(concurrency)]

    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        results = list(pool.map(lambda key: post_intent(client, per_request_ngn, key), keys))

    allowed = [r for r in results if r["status"] == "allowed"]
    denied = [r for r in results if r["status"] == "denied"]
    remaining_after = min(Decimal(r["remaining_daily_ngn"]) for r in results)
    actually_spent = remaining_before - remaining_after

    print(f"Allowed: {len(allowed)}  Denied: {len(denied)}  Unaccounted: {concurrency - len(allowed) - len(denied)}")
    print(f"Actually spent this burst: NGN {actually_spent}")

    no_overspend = actually_spent <= remaining_before
    count_within_bound = len(allowed) <= upper_bound_allowed
    all_accounted_for = len(allowed) + len(denied) == concurrency
    spend_matches_allowed_count = actually_spent == len(allowed) * per_request_ngn

    ok = no_overspend and count_within_bound and all_accounted_for and spend_matches_allowed_count
    print("PASS" if ok else "FAIL — overspend, miscount, or spend/allowed-count mismatch detected")
    return ok


def run_idempotency_test(client: httpx.Client, concurrency: int) -> bool:
    print(f"\n=== Idempotency test: {concurrency} concurrent requests, identical idempotency_key ===")
    key = f"load-test-idempotency-{uuid.uuid4()}"
    amount = Decimal("10")

    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        results = list(pool.map(lambda _: post_intent(client, amount, key), range(concurrency)))

    references = {r["receipt"]["rail_reference"] if r["receipt"] else None for r in results}
    replays = sum(1 for r in results if r["is_replay"])

    print(f"Distinct receipt references seen: {len(references)} (must be 1)")
    print(f"Replays reported: {replays} of {concurrency} (must be {concurrency - 1})")

    ok = len(references) == 1 and replays == concurrency - 1
    print("PASS" if ok else "FAIL — duplicate charge detected")
    return ok


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument("--concurrency", type=int, default=30)
    parser.add_argument("--per-request-ngn", type=Decimal, default=Decimal("50"))
    parser.add_argument("--api-key", default=os.environ.get("JANUS_API_KEY", ""), help="or set JANUS_API_KEY")
    args = parser.parse_args()

    if not args.api_key:
        print("No API key given (--api-key or JANUS_API_KEY) — every request will 401.", file=sys.stderr)
        return 2

    with httpx.Client(base_url=args.base_url, headers={"X-API-Key": args.api_key}) as client:
        policy = fetch_policy(client)
        per_tx_cap = Decimal(policy["per_tx_cap_ngn"])
        if args.per_request_ngn > per_tx_cap:
            print(
                f"--per-request-ngn ({args.per_request_ngn}) exceeds the active policy's "
                f"per_tx_cap_ngn ({per_tx_cap}) — every request would be denied for that reason "
                "instead of testing the daily-cap race. Pick a smaller amount.",
                file=sys.stderr,
            )
            return 2

        budget_ok = run_budget_test(client, args.concurrency, args.per_request_ngn)
        idempotency_ok = run_idempotency_test(client, args.concurrency)

    print("\n=== Summary ===")
    print(f"Budget correctness under concurrency: {'PASS' if budget_ok else 'FAIL'}")
    print(f"Idempotency under concurrency:        {'PASS' if idempotency_ok else 'FAIL'}")

    return 0 if (budget_ok and idempotency_ok) else 1


if __name__ == "__main__":
    sys.exit(main())
