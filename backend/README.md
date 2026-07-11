# Janus backend

FastAPI implementation of the P0 (core gate) and P1 (Paystack test-mode executor) milestones
from [`../PRD.md`](../PRD.md). See that file for the full spec — this is just how to run it.

## What's here

- `app/decision_engine.py` — the pure `(intent, policy, spend_state) -> Decision` function. No I/O.
- `app/ledger.py` — atomic budget reservation (Redis Lua script) + durable, idempotent
  persistence (Postgres unique constraint on `idempotency_key`).
- `app/executors/paystack.py` — creates a Paystack transfer recipient and initiates a transfer.
- `app/routers/` — `POST /intents`, `GET /policy`, `GET /audit`.

## Run it

```bash
cp .env.example .env               # fill in PAYSTACK_SECRET_KEY (sk_test_... for now)
cp recipients.example.json recipients.json   # real bank details for anyone you allow-list

docker compose up -d               # postgres + redis
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload      # tables are created on startup, policy is seeded on first read
```

The first request to `GET /policy` seeds a default policy (₦2,000 daily cap, ₦1,000 per-tx cap,
₦500 approval threshold, empty recipient allowlist). Recipients and categories start closed —
add them by updating the active `PolicyModel` row (there's no write endpoint yet; that's P2+).

## Try it

```bash
curl -X POST localhost:8000/intents -H 'Content-Type: application/json' -d '{
  "amount_ngn": 150,
  "recipient": "rider_1",
  "category": "delivery",
  "reason": "delivery fee",
  "idempotency_key": "demo-1"
}'

curl localhost:8000/audit
```

`recipient` and `category` must be on the active policy's allowlists or the intent is denied.
`recipient` must also have an entry in `recipients.json` (name/account_number/bank_code) or
a resulting `allow` will fail at the Paystack step.

## Tests

```bash
docker compose up -d        # tests run against real postgres + redis, not mocks
pytest -q
```

`tests/test_decision_engine.py` — pure unit tests, no infra needed.
`tests/test_ledger_concurrency.py` — fires concurrent requests at a real Redis-backed ledger
and asserts the daily cap is never exceeded and duplicate idempotency keys never double-spend.
`tests/test_api_intents.py` — full `POST /intents` path with a fake executor, covering the
success/failure/replay budget-reservation lifecycle.

## What's not here yet

- P2: Telegram approval loop for `needs_approval` verdicts (currently they're recorded and
  logged, but nothing notifies you or unblocks them).
- A policy-write endpoint — policy changes are a manual DB update for now.
- Alembic migrations — tables are created via `Base.metadata.create_all()` on startup. Fine
  for one operator; swap in `alembic/` before this has more than one deployment target.
