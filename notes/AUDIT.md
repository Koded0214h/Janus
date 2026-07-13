# Janus — Build Audit

A running record of what's actually been built and verified, not planned. This is a project
build log — not the same thing as the payment audit trail (`GET /audit` on the live API,
covered below as one of the things that got built).

Every item marked **verified live** was actually exercised against real infrastructure
(real Postgres/Redis, the real Paystack test API, a real email inbox, a real running server) —
not just covered by unit tests. Where something is still open or blocked, that's stated plainly.

---

## 0. Repo pivot

The original Janus (Solana vault manager — Drift perp hedging, Ika MPC key-splitting) was
archived wholesale to `legacy/`. `README.md` and `PRD.md` were rewritten from scratch for the
current vision: a self-hosted policy gate for agent-initiated naira payments over Paystack.

## 1. P0 — Core gate

- **Decision engine** (`backend/app/decision_engine.py`) — the intent parser/gate itself. A
  pure function: `(intent, policy, spend_state, float_limit_ngn) -> Decision`. No I/O. Checks
  category, recipient, per-tx cap, float ceiling, daily cap, velocity, approval threshold, in
  that order, and returns `allow` / `deny` / `needs_approval` with a reason.
- **Spend ledger** (`backend/app/ledger.py`) — atomic budget reservation via a Redis Lua script
  covering the daily cap, the velocity window, and the float ceiling together; a Postgres
  unique constraint on `idempotency_key` makes replay detection atomic too.
- **Append-only audit trail** — `GET /audit`, joins intent + decision + transfer, never edited
  in place.
- **Hard float ceiling enforced independently of policy** — a gap found during review (the PRD
  calls this non-negotiable #3) and closed: `float_limit_ngn` is a separate argument to the
  decision engine, not part of `PolicyConfig`, so a misconfigured policy literally cannot
  authorize more than it.
- **Verified live**: 11 decision-engine unit tests; concurrency tests firing real parallel
  requests at a real Redis/Postgres-backed ledger proving zero overspend and zero double-pay,
  including under a deliberately reckless policy whose daily cap sits far above the float limit.

## 2. P1 — Paystack executor (test mode)

- `PaystackExecutor` (`backend/app/executors/paystack.py`) creates a transfer recipient and
  initiates a transfer via Paystack's real Test API.
- **Verified live**: real account resolution (a real bank account name came back from
  Paystack), real recipient creation, real transfer call. First attempt was rejected by
  Paystack itself — `"You cannot initiate third party payouts as a starter business"` — an
  account-tier restriction, not a Janus bug. Second attempt, against a business-verified test
  key, succeeded and returned a real `transfer_code` in `otp` (pending) state — again an
  account-level Paystack setting outside Janus's control, not a code gap.
- Ledger correctly releases the budget reservation whenever the executor call fails.

## 3. P2 — Approval loop

- `ApprovalChannel` interface (`backend/app/approvals/`). `EmailApprovalChannel` is real (Gmail
  SMTP via stdlib `smtplib`, no new dependency). `TelegramApprovalChannel` is an explicit stub —
  raises `NotImplementedError` with a clear message if selected.
- `POST /intents` **blocks** synchronously on a `needs_approval` verdict until a human resolves
  it or `APPROVAL_TIMEOUT_SECONDS` (default 300s) elapses — matches the PRD's blocking-approval
  requirement. No answer within the timeout defaults to deny.
- The budget reservation is **held**, not released, while pending — approving keeps it,
  denying or timing out releases it.
- Resolution is a safe two-step flow: the email links to a non-mutating `GET
  /approvals/{token}` confirmation page (so mail-client link-prefetching can't silently trigger
  an approval), which then `POST`s the real approve/deny action. `resolve()` is race-safe —
  only the first resolution on a token sticks, and an already-expired row refuses a late click.
- **Verified live**: a real email was sent to a real inbox, clicked for real, and the blocked
  HTTP request unblocked with the correct final decision. Tested for both approve and deny.

## 4. API authentication

Added after a review found the API had **no authentication at all** — anyone who could reach
the server could submit payment intents with zero credentials.

- `X-API-Key` header required on `/intents`, `/policy`, `/audit`.
- Fails closed: an unset `API_KEY` rejects every request rather than silently letting them
  through.
- `/health` stays public (standard for liveness checks). `/approvals/{token}/*` stays
  token-authenticated on purpose — the unguessable token in the link is the correct credential
  for whoever's approving, not the operator's main key.
- **Verified live**: no key and a wrong key both 401, the correct key 200s.

## 5. Policy versioning

`PolicyModel`'s own docstring always said "rows are never updated in place — a change inserts
a new version," but no code path did that; every policy change up to this point had been a
manual DB edit that directly violated it.

- `POST /policy` now creates a new version and deactivates the previous one.
- `GET /policy` always returns the latest active version.
- **Verified live**: version bumped 1 → 2 through the real API, with the previous version
  correctly deactivated.

## 6. P4 — Harden + demo prep

- **Load test** (`backend/scripts/load_test.py`) — real HTTP against a live, running server
  (not in-process), firing overlapping intents to prove zero overspend and zero double-pay.
  Assertions are upper-bound rather than exact-count, so the test is correct whether the daily
  cap or the velocity limit ends up being the binding constraint.
- **Threat model** (in `README.md`) — five threats (rogue/manipulated agent, replayed request,
  leaked key, misconfigured policy, unauthenticated API access), each mapped to the mitigation
  actually implemented, not an aspirational one.
- **MCP `pay` tool** (`mcp_server/`) — one tool wrapping `POST /intents`, so any MCP-compatible
  agent (Claude Desktop, Claude Code, etc.) gets a payment tool with the guardrails built in.
  Deliberately isolated into its own venv and `requirements.txt` after `mcp`'s own dependencies
  were found to silently pull in a `starlette` version that broke FastAPI's pin in the same
  environment — a real conflict, caught and fixed by isolation rather than papered over.
- **Verified live**: all four verdict paths (allow, deny, needs_approval → approved,
  needs_approval → denied) exercised through the actual MCP tool, not just raw HTTP.
- **Demo clip** — not done. Requires the operator to record it; nothing left to build first.

## 7. Python SDK (`sdks/python/`)

- `Janus` client — `pay()`, `get_policy()`, `set_policy()`, `get_audit()`. One dependency
  (`httpx`), typed dataclass responses (`Decision`, `Policy`, `AuditEntry`, `Receipt`).
- Deliberately preserves the wording split already in the backend: `Decision.status` is
  `"allowed"`/`"denied"` (the wire contract), `AuditEntry.verdict` is `"allow"`/`"deny"` (the
  raw engine value) — not smoothed over into false consistency.
- **Verified**: 10 tests against `httpx.MockTransport` (no live server dependency), plus a live
  smoke test against the real running backend confirming typed parsing, the auth header, and
  real decision/policy/audit data all round-trip correctly.
- TypeScript and Rust clients explicitly **not** built — no real consumer has asked for them
  yet, and "support every language" was the instinct that helped sink Janus v1.

## Bugs found and fixed along the way

- A FastAPI dependency (`get_executor`'s own `settings` parameter) wasn't wrapped in
  `Depends()`, which made FastAPI treat it as a second request-body field and broke every
  `/intents` call. Caught immediately by the first live request, not left for later.
- Fresh decisions used a Python-clock timestamp while replayed decisions used the DB-clock
  timestamp — could disagree under clock skew (observed directly: a replay showed an *earlier*
  `evaluated_at` than the original). Fixed so both paths source the timestamp from the
  persisted row.
- `mcp`'s dependency chain silently upgraded `starlette` past what FastAPI's pin allows, in the
  same virtualenv as the backend. Caught via a dependency-conflict warning during install
  before it could cause a subtler runtime break; fixed by isolating the MCP server into its
  own environment.

## What's still open

- **P3 (live cutover)** — blocked on Paystack's OTP-for-transfers setting on the test account
  currently in use. External, not a code gap; unblocks the moment that setting changes or a
  fully verified account with it disabled is available.
- **Demo clip** — not recorded.
- `recipients.json` is cached for the life of the process — editing it requires a server
  restart to take effect.
- No Alembic migrations — tables are created via `Base.metadata.create_all()` on startup. Fine
  at single-operator scale; worth revisiting before there's more than one deployment target.
- No real Telegram bot — `TelegramApprovalChannel` is a stub behind the same interface as the
  working email channel.

## Test coverage snapshot

- `backend/`: **42 tests** passing — decision engine, ledger concurrency, approvals, auth,
  policy versioning, full API integration.
- `sdks/python/`: **10 tests** passing — client behavior against a mocked transport.
