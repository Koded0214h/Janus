# Janus MCP server

Exposes Janus as a single MCP tool, `pay` — the PRD §8 distribution model. Deliberately kept
separate from `backend/`, with its own `requirements.txt` and venv: this is a thin HTTP client
of the Janus API, not part of the API server, and has no reason to share (or risk conflicting
with) FastAPI's dependency graph. (`mcp`'s own dependencies pulled in a `starlette` version
that broke FastAPI's pin when tried in the same environment — this split isn't precautionary,
it's fixing a real conflict.)

## Setup

```bash
cd mcp_server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Requires a running Janus backend (see `../backend/README.md`). Set `JANUS_BASE_URL` if it's not
on `http://localhost:8000`, and `JANUS_API_KEY` to match the backend's `API_KEY` — every route
is auth-required now, so the tool 401s without it (it'll warn on startup if unset).

## Run

```bash
JANUS_API_KEY=... python server.py
```

This starts a stdio MCP server. Point an MCP client at it — for Claude Desktop / Claude Code,
add something like this to your MCP config:

```json
{
  "mcpServers": {
    "janus": {
      "command": "/absolute/path/to/mcp_server/.venv/bin/python",
      "args": ["/absolute/path/to/mcp_server/server.py"],
      "env": { "JANUS_BASE_URL": "http://localhost:8000", "JANUS_API_KEY": "..." }
    }
  }
}
```

Any MCP-compatible agent then sees one tool, `pay(amount_ngn, recipient, category, reason, idempotency_key)`,
and gets back Janus's decision JSON (`status`, `reason`, `receipt`, `remaining_daily_ngn`, ...).
If the amount needed human approval, this call already blocked until that was resolved — the
agent only ever sees a final `"allowed"` or `"denied"`, never a dangling pending state.

## Quick smoke test without a real MCP client

```bash
JANUS_API_KEY=... python -c "
import server
print(server.pay(
    amount_ngn=150, recipient='rider_1', category='delivery',
    reason='smoke test', idempotency_key='smoke-1',
))
"
```
