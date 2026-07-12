# janus-sdk

A thin Python client for [Janus](../../README.md) — the policy gate for agent-initiated
payments. One dependency (`httpx`), four methods, typed responses.

You don't need this to use Janus — it's a plain REST API, callable from any language with an
HTTP client. This just saves you writing the request/response boilerplate yourself if you're
in Python.

## Install

```bash
pip install -e sdks/python   # not published yet — local/editable install for now
```

## Use

```python
from janus_sdk import Janus

with Janus(base_url="http://localhost:8000", api_key="...") as janus:
    decision = janus.pay(
        amount_ngn=150,
        recipient="rider_1",
        category="delivery",
        reason="delivery fee",
        idempotency_key="order-A12-payout",  # omit and one is generated for you
    )

    if decision.allowed:
        print("paid:", decision.receipt.rail_reference)
    else:
        print("blocked:", decision.reason)
```

`pay()` blocks until Janus reaches a final answer — if the amount needed human approval, this
call already waited for that (up to the backend's `APPROVAL_TIMEOUT_SECONDS`), so
`decision.status` is always `"allowed"` or `"denied"` here, never a dangling `"needs_approval"`.
The client's own timeout defaults to 310s to match.

```python
    policy = janus.get_policy()

    janus.set_policy(
        daily_cap_ngn=2000, per_tx_cap_ngn=1000, approval_threshold_ngn=500,
        allowed_categories=["delivery", "airtime"], allowed_recipients=["rider_1"],
        velocity_limit_count=10, velocity_window_seconds=3600,
    )  # creates a new policy version, never edits one in place

    for entry in janus.get_audit(limit=50):
        print(entry.idempotency_key, entry.verdict, entry.amount_ngn)
```

Note: `AuditEntry.verdict` is the raw engine value (`"allow"` / `"deny"` / `"needs_approval"`),
not `Decision.status`'s wire wording (`"allowed"` / `"denied"`) — the audit log is a debugging
view kept as the decision engine sees it, deliberately not translated. See `models.py`.

## Errors

```python
from janus_sdk import JanusAuthError, JanusAPIError

try:
    janus.pay(...)
except JanusAuthError:
    ...  # wrong or missing API key (HTTP 401)
except JanusAPIError as exc:
    ...  # exc.status_code, exc.body — anything else non-2xx
```

## Tests

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[test]"
pytest
```

All 10 tests run against `httpx.MockTransport` — no live server needed, fast and self-contained.
Verified separately against a real running backend (see the snippet under "Use" above — that's
exactly what was run).

## What's not here

- Async client — everything is sync `httpx.Client`, matching the pattern used in
  `mcp_server/server.py`. Add an `AsyncJanus` if a real async caller shows up.
- PyPI publishing — this is a local/editable install for now, not on the index.
- TypeScript, Rust, or any other language — deliberately not built until there's an actual
  consumer asking for one, per the project's own scope discipline (see `PRD.md`'s kill list
  and personal notes — this is exactly the kind of "support everything" instinct that sank v1).
