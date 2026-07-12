# Janus

**A programmable trust layer that sits between an AI agent and a payment rail, and answers one question: is this payment allowed, right now, under the rules I set?**

Allow. Deny. Or ask me first. That is the entire product.

Built naira-first, for the corner of agentic payments the global players have written off: African fiat, real bank transfers over NIP, starting on Paystack.

Janus is named for the Roman god of gates and doorways, the one with two faces looking in opposite directions. That is literally what this is: a gate that faces the agent on one side and you on the other.

---

## The problem

Software is getting good enough to spend money on your behalf. The hard part was never giving software a way to pay, Paystack and every bank already expose that over an API. The hard part is making sure it only spends what you allowed, on what you allowed, up to the limit you allowed, and that a retry or a bug or a manipulated prompt can't quietly drain you.

That missing piece is not a payment API. It is programmable trust. Janus is only that piece.

## Where you've already seen this idea

If you're in Nigeria, Paystack Index is the consumer version of this future: you let an AI assistant buy airtime, send money through Zap, or order food on Chowdeck, and it acts within permissions and spending limits you set. Janus is the developer's version of that control layer. It is the self-hosted gate you put in front of your own agent so it can pay on a live rail without being dangerous, with the limits, approvals, and audit trail you'd want before you ever switched it on.

## What Janus is

Janus is a paying proxy with a policy gate in front of it. An agent hands Janus a payment intent. Janus checks it against your rules, and only if every rule passes does it execute a real transfer through a fiat rail from a small, deliberately funded float. Every decision, allowed or denied, is written to an append-only audit log with the reason and, when a payment happens, the rail's reference.

Three things make it real rather than a toy:

1. **It moves real money.** Payments settle as real naira bank transfers through Paystack. Not mocked, not simulated.
2. **The blast radius is capped by design.** The agent never touches your main account. Janus disburses only from a small pre-funded float, so the worst case is the float, not your money.
3. **The correctness layer is the point.** Atomic budget accounting, idempotency keys, and a clean decision state machine are what let real money move safely under retries and concurrency. That is the interesting engineering.

## What Janus is NOT

This list exists so the project never spirals into four products again.

- **Not a yield optimizer.** It does not decide where your money should go to earn more.
- **Not an identity or proof-of-personhood system.** No ZK, no age-proofs.
- **Not a breach-detection or auto-vaulting service.**
- **Not a bank or a custodian.** Janus holds one thing: access to a small float you funded, plus the rules for spending it. The moment it reaches to manage your real balance, it has rebuilt the thing that killed v1.

## How it works

![Janus system architecture: an agent sends a payment intent to Janus, which routes through a decision engine, spend ledger, and approval channel, then an agnostic payment rail (executor, NIP transfer, bank) before writing to an append-only audit log.](sys_arch.png)


1. The agent sends an intent: `{ amount_ngn, recipient, category, reason, idempotency_key }`.
2. The **decision engine** evaluates it against your policy plus current spend and returns `allowed`, `denied`, or `needs_approval`, each with a reason.
3. On `needs_approval`, the **approval channel** emails you a link to approve or deny and blocks until you click one, or it times out to deny. Email is the working channel for now; Telegram and SMS are documented as later options, wired as a stub interface today.
4. On `allowed`, the **executor** performs the real transfer from the float and returns the receipt. This is the only rail-aware piece — Paystack today, others drop in behind the same interface later.
5. The **spend ledger** decrements the budget atomically and records everything. Idempotency keys guarantee a retried intent can't pay twice.

## The one call a developer makes

The agent never calls Paystack. It calls Janus, ideally as a single MCP tool named `pay`, so any agent framework picks it up as a tool the LLM can invoke.

```python
decision = janus.pay(
    amount_ngn=150,
    recipient="0123456789@Access",
    category="vendor-payout",
    reason="Groundnut supplier, order #A12",
    idempotency_key="order-A12-payout",
)
# decision.status -> "allowed" | "denied" | "needs_approval"
```

The mental model for the developer: give your agent a `pay` tool that physically cannot overspend.

## Trust model in one sentence

Janus can only spend from a float you funded with a small amount, strictly inside rules you set, and it logs every decision, so the most it can ever cost you is the float.

## Tech stack

- **Python + FastAPI** for the gate service.
- **PostgreSQL** for policies and the durable audit trail.
- **Redis** for atomic spend counters and velocity windows.
- **Paystack API** (Transfers) as the local rail, settling **naira over NIP**. The executor is an interface, so Stripe (international) or x402 (borderless) drop in later without touching the gate.
- **Gmail SMTP** for approvals today (stdlib `smtplib`, no new dependency); Telegram Bot API is the documented next channel, stubbed but not wired.
- **Docker Compose** for local bring-up.

## Quickstart

> Build against Paystack **test mode** first. Real API, test keys, no real money. Flip to live only once the gate is proven.

```bash
git clone https://github.com/koded0214h/janus.git
cd janus/backend

cp .env.example .env                          # fill in PAYSTACK_SECRET_KEY (sk_test_... for now)
cp recipients.example.json recipients.json    # real bank details for anyone you allow-list

docker compose up -d                           # postgres + redis
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload                  # tables + default policy are created on first run
```

`backend/.env` (test phase):

```env
DATABASE_URL=postgresql+psycopg://janus:janus@localhost:5432/janus
REDIS_URL=redis://localhost:6379/0
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_BASE_URL=https://api.paystack.co
FLOAT_LIMIT_NGN=2000
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Live cutover: swap in `sk_live_...`, fund the Paystack balance with a small real float (start at ₦2,000), and pre-create your allowlisted recipients. Nothing in the gate changes.

> **Honest dependency:** live Paystack transfers need a verified business and recipients created ahead of time, and may prompt an OTP depending on your settings. Sort that once, and real money is a config flip.

See [`backend/README.md`](backend/README.md) for the full run-and-test guide, including the float-ceiling reset step.

## Policy example

Declarative JSON, evaluated top to bottom. This is your standing authorization, the scope you sign once.

```json
{
  "daily_cap_ngn": 2000,
  "per_tx_cap_ngn": 200,
  "approval_threshold_ngn": 200,
  "allowed_categories": ["airtime", "data", "vendor-payout", "delivery"],
  "allowed_recipients": ["0123456789@Access", "9876543210@GTB"],
  "velocity": { "max_tx": 20, "window_seconds": 60 }
}
```

## The demo

An agent runs errands. Small payouts sail through (₦150 to a known vendor). A transfer over the approval threshold emails you a link, and the request blocks until you approve or deny it. A transfer to an account not on the allowlist is auto-denied with a printed reason. Hit the daily cap and everything locks. The audit log shows every decision and why, each allowed transfer carrying its real Paystack reference, and the money actually lands.

That two-minute demo is the thesis running live: not making payments autonomous, making autonomous payments trustworthy.

## Scale and security, kept honest

"Built for scale" here means the decision path is stateless and the ledger stays correct under concurrent load, proven with one load test. "Secure" means the float cap holds independently of policy, secrets live only in env, and the audit log cannot be edited in place, backed by one short threat model in the docs. It does not mean multi-tenancy, dashboards, or a pile of infra nobody asked for. The scalable, secure version of Janus is still just the gate.

## Status

Deliberate rebuild. Full spec, milestones, and notes in [PRD.md](./PRD.md). A [Koded Labs](https://kodedlabs.com) project.

## Disclaimer

Janus moves real funds through a live payment provider. Experimental software, not financial or security advice. Small float, keys out of git, and remember that bank transfers are not easily reversed.