# Janus backend

FastAPI implementation of the P0 (core gate), P1 (Paystack test-mode executor), and P2
(human-in-the-loop approval) milestones from [`../PRD.md`](../PRD.md). See that file for
the full spec — this is just how to run it.

## What's here

- `app/decision_engine.py` — the pure `(intent, policy, spend_state, float_limit_ngn) -> Decision`
  function. No I/O. `float_limit_ngn` is separate from `policy` on purpose (see below).
- `app/ledger.py` — atomic budget reservation (Redis Lua script) + durable, idempotent
  persistence (Postgres unique constraint on `idempotency_key`).
- `app/executors/paystack.py` — creates a Paystack transfer recipient and initiates a transfer.
  `find_by_reference()` reconciles against Paystack's own records when the local receipt is
  missing (see "Idempotency across the rail boundary" below) — every `Executor` must implement it.
- `app/approvals/` — the human-in-the-loop escalation for `needs_approval` verdicts. `email_channel.py`
  is real (Gmail SMTP); `telegram_channel.py` is a stub (see below).
- `app/auth.py` — a single shared-secret header (`X-API-Key`) required on every route except
  `/health` and `/approvals/{token}/*` (see below).
- `app/routers/` — `POST /intents`, `GET/POST /policy`, `GET /audit`, `GET/POST /approvals/{token}`.

## Run it

```bash
cp .env.example .env               # fill in API_KEY, PAYSTACK_SECRET_KEY (sk_test_... for now),
                                    # and SMTP_USERNAME/SMTP_PASSWORD/APPROVAL_EMAIL_TO for approvals
cp recipients.example.json recipients.json   # real bank details for anyone you allow-list

docker compose up -d               # postgres + redis
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload      # tables are created on startup, policy is seeded on first read
```

Generate `API_KEY` with `python -c "import secrets; print(secrets.token_urlsafe(32))"`. Every
request to `/intents`, `/policy`, or `/audit` needs an `X-API-Key` header matching it — leaving
`API_KEY` unset rejects every request rather than silently allowing them through.

The first request to `GET /policy` seeds a default policy (₦2,000 daily cap, ₦1,000 per-tx cap,
₦500 approval threshold, empty recipient allowlist). Recipients and categories start closed —
change them with `POST /policy` (see below), not a manual DB edit.

## Authentication

Every route except `GET /health` and `/approvals/{token}/*` requires `X-API-Key: <API_KEY>`.
The `/approvals/*` endpoints are deliberately *not* API-key gated — they're meant to be clicked
from an email by whoever is approving, not called by whoever holds the main key, and the
unguessable token in the URL is the credential there instead (`secrets.token_urlsafe(24)`,
race-safe resolution, see the approval loop section below).

A missing or wrong key gets a `401`, including when `API_KEY` itself isn't set — an unset key
fails closed, it does not mean auth is off (`app/auth.py`).

## The float ceiling

`FLOAT_LIMIT_NGN` in `.env` is a hard, cumulative ceiling on money ever disbursed, enforced in
the same atomic Redis reservation as the daily cap and velocity window — **independently of
policy**. Even if `daily_cap_ngn` in the active policy is misconfigured far above what you
actually funded into Paystack, the float ceiling still blocks it. This is non-negotiable per
the PRD (§7.3): a bad policy value must never be able to authorize more than the real funded float.

The counter (`janus:spend:float_total` in Redis) never expires and never resets on its own —
that's deliberate, it's a standing ceiling, not a rolling window. When you top up the real
Paystack balance, reset it by hand:

```bash
docker compose exec redis redis-cli DEL janus:spend:float_total
```

Redis runs with AOF persistence and a named volume (`docker-compose.yml`), `appendfsync always`
— this counter is the non-negotiable ceiling, and it needs to survive a container restart, not
silently reset to 0 and defeat the whole point. Verified: a value written, the container fully
removed and recreated, the value was still there.

## Idempotency across the rail boundary

The unique constraint on `idempotency_key` makes replay detection inside Janus airtight, but
there's a second failure mode: the process can die *between* a successful Paystack call and the
local commit that records it (a dual write, across a network boundary — no transaction spans
both). Two things close this together:

1. **A deterministic reference.** Every `POST /transfer` call sends `reference:
   intent.idempotency_key`. Verified live against the real API: calling `/transfer` twice with
   the same reference gets `duplicate_transfer_reference` from Paystack itself — so even a bug
   that caused Janus to retry the rail call blind could not cause a second real transfer.
2. **Reconciliation on replay.** If a replayed intent resolves to `allowed` but has no local
   `TransferModel` row, Janus does not silently report nothing and does not blindly re-execute —
   it calls `executor.find_by_reference(idempotency_key)` first. If the rail has a record
   (`GET /transfer?reference=X`, verified to filter server-side, not just accept-and-ignore the
   param), the local receipt is healed to match it. Only if the rail has no record either
   (meaning the original call never landed) does Janus execute for real — safe, because the
   deterministic reference is still the backstop if there's ever a same-instant race.

Verified live end to end: a transfer was initiated directly against Paystack (simulating the
crash — Janus never recorded it locally), then the same `idempotency_key` was replayed through
the real API. Janus found the transfer, healed the local record with the real `transfer_code`,
and the audit log now shows it — no data loss, no re-initiation.

## The approval loop

`needs_approval` verdicts escalate over `APPROVAL_CHANNEL` (`.env`), default `email`:

- **`email`** (working) — sends via Gmail SMTP using stdlib `smtplib`, no extra dependency.
  Use an [App Password](https://myaccount.google.com/apppasswords) for `SMTP_PASSWORD`, not
  your login password (Gmail rejects plain passwords once 2FA is on, which App Passwords require).
- **`telegram`** (stub) — the interface exists (`app/approvals/telegram_channel.py`) matching
  the PRD's architecture, but `notify()` just raises `NotImplementedError`. Wire a real bot
  here later; nothing else in the approval flow needs to change.

The email links to `GET /approvals/{token}`, a plain confirmation page with Approve/Deny
buttons — deliberately *not* a direct action link, since mail clients and security scanners
auto-prefetch GET links and would otherwise silently resolve requests. The buttons `POST` to
`/approvals/{token}/approve` or `/approvals/{token}/deny`, which is race-safe: only the first
resolution on a given token sticks.

`POST /intents` **blocks** for the duration of the wait (up to `APPROVAL_TIMEOUT_SECONDS`,
default 300) — polling the approval row every second — then returns the final `allowed`/`denied`
outcome directly, per the PRD's blocking-approval requirement. No answer within the timeout
defaults to deny. This ties up one worker thread per pending approval; fine at single-operator
scale, worth revisiting (webhooks/websockets) if that ever changes.

The budget reservation is *held*, not released, while a decision is pending approval — approving
keeps it, denying or timing out releases it back to the daily cap.

## Try it

```bash
export JANUS_API_KEY=...  # whatever you set API_KEY to in .env

curl -X POST localhost:8000/policy -H "X-API-Key: $JANUS_API_KEY" -H 'Content-Type: application/json' -d '{
  "daily_cap_ngn": 2000, "per_tx_cap_ngn": 1000, "approval_threshold_ngn": 500,
  "allowed_categories": ["delivery"], "allowed_recipients": ["rider_1"],
  "velocity_limit_count": 10, "velocity_window_seconds": 3600
}'

curl -X POST localhost:8000/intents -H "X-API-Key: $JANUS_API_KEY" -H 'Content-Type: application/json' -d '{
  "amount_ngn": 150,
  "recipient": "rider_1",
  "category": "delivery",
  "reason": "delivery fee",
  "idempotency_key": "demo-1"
}'

curl localhost:8000/audit -H "X-API-Key: $JANUS_API_KEY"
```

`recipient` and `category` must be on the active policy's allowlists or the intent is denied —
`POST /policy` above is how you set that (it creates a new policy *version*, per-row-immutable,
never an in-place update; `GET /policy` always returns the latest active one). `recipient` must
also have an entry in `recipients.json` (name/account_number/bank_code) or a resulting `allowed`
will fail at the Paystack step.

The response shape follows PRD §8:

```json
{
  "id": "dec_9f2",
  "status": "allowed",
  "reason": "within budget, category, recipient, and velocity limits",
  "policy_version": 1,
  "evaluated_at": "2026-07-12T17:23:34Z",
  "is_replay": false,
  "remaining_daily_ngn": "1850.00",
  "receipt": { "rail": "paystack", "rail_reference": "TRF_8x2", "amount_ngn": "150.00", "status": "success" },
  "approval_url": null,
  "expires_at": null
}
```

`status` is `"allowed"`, `"denied"`, or `"needs_approval"` — in practice you'll only ever see
`"needs_approval"` transiently in the audit log, since `/intents` blocks until it resolves to
`allowed` or `denied` before responding. `approval_url`/`expires_at` stay `null` in every
response for the same reason: by the time the HTTP call returns, there's nothing left pending
to show a link for.

## Tests

```bash
docker compose up -d        # tests run against real postgres + redis, not mocks
pytest -q
```

`tests/test_decision_engine.py` — pure unit tests, no infra needed, including the float-ceiling
branch (a payment denied by the ceiling even under a deliberately generous/misconfigured policy).
`tests/test_ledger_concurrency.py` — fires concurrent requests at a real Redis-backed ledger and
asserts the daily cap and float ceiling are never exceeded and duplicate idempotency keys never
double-spend, even under a race.
`tests/test_api_intents.py` — full `POST /intents` path with a fake executor, covering the
success/failure/replay budget-reservation lifecycle, the float-ceiling denial path, the
approve/deny/timeout approval flow, and the rail-boundary reconciliation crash (simulates a
missing local receipt and asserts Janus checks the rail before ever re-executing).
`tests/test_approvals.py` — `ApprovalService` in isolation: the blocking wait resolves
correctly on approve/deny, times out to deny when nobody answers, and `resolve()` is race-safe
(first resolution wins, an already-expired row refuses a late click).
`tests/test_auth.py` — the auth dependency in isolation, including fail-closed on an unset key.
`tests/test_policy.py` — `POST /policy` creates a new version and deactivates the previous one
(never an in-place update), and requires the API key like everything else.

## Load test

`scripts/load_test.py` is the PRD §11 load test — real HTTP against a *running* server (not
in-process), firing overlapping intents to prove zero overspend and zero double-pay:

```bash
uvicorn app.main:app --reload &          # needs a live server, unlike pytest
python scripts/load_test.py --concurrency 30 --per-request-ngn 50 --api-key "$JANUS_API_KEY"
```

It reads the active policy's `per_tx_cap_ngn` first and refuses to run if `--per-request-ngn`
exceeds it (that would test the per-tx-cap check instead of the daily-cap race). Assertions are
upper-bound, not exact-count — if the velocity limit binds before the daily cap does, that's
still a pass, since the property being proven is "never overspend," not "the daily cap is
always what stops it."

## Finishing an OTP-pending transfer

Some Paystack accounts have OTP-for-transfers enabled — an account security setting, not
anything Janus's decision engine or ledger controls. When that's on, a `receipt.status` of
`"otp"` means the transfer was authorized and initiated for real, but Paystack is holding it
for a one-time code sent to the account owner. `scripts/finalize_transfer.py` completes it once
you have that code, and updates the local `TransferModel` row to match:

```bash
python scripts/finalize_transfer.py --idempotency-key demo-1 --otp 123456
```

This has been run against the real Paystack API end to end: transfer authorized → `otp` →
finalized → `success`, independently confirmed via Paystack's own `GET /transfer/:code`.

## What's not here yet

- A real Telegram bot — `TelegramApprovalChannel` is a stub; email is the only working
  approval channel right now.
- Live-reload for `recipients.json` — it's read once and `@lru_cache`d for the process
  lifetime; editing it requires a restart to take effect.
- Alembic migrations — tables are created via `Base.metadata.create_all()` on startup. Fine
  for one operator; swap in `alembic/` before this has more than one deployment target.
- Fully automatic live cutover — a transfer on an OTP-enabled account still needs a human to
  relay the one-time code once per transfer (see above). Not a gap in Janus; that's Paystack's
  own account-level security control.
