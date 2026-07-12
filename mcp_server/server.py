#!/usr/bin/env python3
"""Janus as an MCP server — PRD §8's distribution model: one tool, `pay`, so any MCP-compatible
agent (Claude Desktop, Claude Code, the OpenAI Agents SDK, LangChain, ...) picks up a payment
tool with Janus's guardrails already inside. Two-line adoption, not a rewrite.

Deliberately isolated from backend/ with its own requirements.txt and venv — this is a thin
HTTP client of the Janus API, not part of the API server, and has no reason to share (or risk
conflicting with) FastAPI's dependency graph.

Run:
    python server.py

Then point an MCP client at this as a stdio server. Set JANUS_BASE_URL if Janus isn't on the
default localhost:8000.
"""

import os

import httpx
from mcp.server.fastmcp import FastMCP

JANUS_BASE_URL = os.environ.get("JANUS_BASE_URL", "http://localhost:8000")
# Longer than Janus's own APPROVAL_TIMEOUT_SECONDS (default 300s) — a needs_approval decision
# blocks server-side for up to that long, and this client must not give up first.
HTTP_TIMEOUT_SECONDS = float(os.environ.get("JANUS_HTTP_TIMEOUT_SECONDS", "310"))

mcp = FastMCP("janus")


@mcp.tool()
def pay(amount_ngn: float, recipient: str, category: str, reason: str, idempotency_key: str) -> dict:
    """Submit a payment intent to Janus and get back a gated decision.

    Janus checks the intent against your policy (budget, category, recipient, velocity) before
    any money moves. The response's "status" is "allowed" or "denied" — if the amount needed
    human sign-off, this call already blocked until that was resolved, so you always get a
    final answer, never a dangling "pending" state. Money only moves on "allowed"; "denied"
    always includes a human-readable "reason" and moves nothing.

    idempotency_key must be unique per real-world payment attempt — retrying with the same key
    is always safe and will never pay twice.
    """
    with httpx.Client(base_url=JANUS_BASE_URL, timeout=HTTP_TIMEOUT_SECONDS) as client:
        response = client.post(
            "/intents",
            json={
                "amount_ngn": str(amount_ngn),
                "recipient": recipient,
                "category": category,
                "reason": reason,
                "idempotency_key": idempotency_key,
            },
        )
        response.raise_for_status()
        return response.json()


if __name__ == "__main__":
    mcp.run()
