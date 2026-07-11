# Janus — Product Requirements Document

**Owner:** Koded (Koded Labs)
**Status:** Draft, active build
**One-liner:** A self-hosted policy gate that lets an AI agent move real naira within rules you set, and refuses everything else.

---

## 1. Background

The v1 of Janus tried to be four products at once: a yield optimizer, a zero-knowledge identity layer, an MPC custody wallet, and a breach-response system. It collapsed under its own scope. This rebuild keeps exactly one piece, the piece the article that started this concluded was the actual hard problem: the trust layer that decides whether a software agent is allowed to spend money.

The wider industry is converging on the same idea. Google's AP2 and Stripe/Tempo's MPP are both authorization layers for agent payments that stop short of moving money themselves. Janus implements that layer for a single user, self-hosted, and wires it to a live Nigerian rail so it moves real money now.

## 2. Problem statement

When an autonomous agent initiates a payment, the assumption every payment system was built on, that a human is present and clicking "confirm," breaks. Without a gate, an agent that can pay can also overpay, pay the wrong party, get manipulated, or double-pay on a retry. Janus is the gate that makes agent-initiated payments safe enough to actually switch on.

## 3. Goals

- Let an agent submit a payment intent and get back a fast, deterministic `allow` / `deny` / `needs_approval` decision.
- Enforce user-defined rules: daily cap, per-transaction cap, approval threshold, category allowlist, recipient allowlist, velocity limit.
- Execute allowed payments as **real naira transfers** through Paystack.
- Escalate borderline payments to a human over Telegram and block on the reply.
- Guarantee correctness under concurrency and retries: no double-spend, no budget drift.
- Keep an append-only audit trail of every decision and its reason.
- Cap total exposure to a small pre-funded float.

## 4. Non-goals (explicit kill list)

- **No yield optimization or fund allocation.** Janus never decides where money should live.
- **No identity, KYC, or proof-of-personhood.**
- **No breach detection or automated "move to safety."**
- **No custody of the user's main funds.** Janus only ever touches the float.
- **No multi-user SaaS, no dashboard polish, no billing.** Single user, one operator, for now.

If a proposed feature is on this list, it does not go in Janus. It becomes a separate project or it does not exist.

## 5. Definition of done

The build is "done" for this cycle when all of the following are true at once:

1. An agent submits an intent and receives a decision in well under a second.
2. A **real** Paystack transfer of a small naira amount, triggered by an `allow`, lands in a real recipient bank account.
3. A payment above the per-transaction cap triggers a Telegram approval and only proceeds on "yes."
4. A payment to a non-allowlisted recipient or over the daily cap is denied with a printed reason and moves no money.
5. Every case above appears in the audit log with the decision, the reason, and (for transfers) the Paystack reference.
6. Replaying the same intent twice moves money at most once.

## 6. Users and primary use case

**User:** one operator (you), running an agent that handles small, repeatable money errands, vendor payouts, airtime and data top-ups, delivery fees, on your behalf, within a budget you set once.

**Core flow:** you set a policy. Your agent, mid-task, needs to pay for something. It asks Janus. Janus decides. Money moves, or it doesn't, and either way you have a record.

## 7. Functional requirements

| # | Requirement | Notes |
|---|-------------|-------|
| F1 | Accept a payment intent over HTTP | `{ amount_ngn, recipient, category, reason, idempotency_key }` |
| F2 | Evaluate intent against policy + current spend | Returns `allow` / `deny` / `needs_approval` + reason |
| F3 | Enforce caps, allowlists, velocity | Daily, per-tx, approval threshold, categories, recipients, rate |
| F4 | Escalate to Telegram on `needs_approval` | Block until yes / no / timeout; timeout defaults to deny |
| F5 | Execute transfer via Paystack on `allow` | Test mode first, live mode on cutover |
| F6 | Record every decision to an append-only log | Decision, reason, timestamp, transfer ref if any |
| F7 | Idempotent execution | Same `idempotency_key` never pays twice |
| F8 | Read endpoints for policy and audit log | So the demo and you can inspect state |

## 8. Non-functional requirements

- **Correctness first.** Budget decrements and idempotency checks are atomic (Redis for the hot counters, Postgres as the durable record). Concurrency must not cause overspend.
- **Fast decisions.** The gate decision is in-memory plus one cache read; the slow part is only the actual transfer.
- **Auditable.** The log is append-only and never edited in place.
- **Safe by construction.** `FLOAT_LIMIT_NGN` is a hard ceiling enforced independently of policy. Secrets live in env, never in git.
- **Rail-agnostic core.** The executor is an interface; swapping Paystack for Flutterwave, Mono, or Squad must not touch the decision engine.

## 9. Architecture

- **API layer (FastAPI):** intake for intents, plus read endpoints.
- **Decision engine:** pure function of `(intent, policy, spend_state) -> verdict`. No side effects. The heart of the system and the most tested part.
- **Spend ledger:** Redis atomic counters for daily total and velocity window; Postgres for the durable ledger and audit trail. Idempotency keys deduplicate.
- **Approval channel:** Telegram bot (reuse KODED OS); publishes an approval request, awaits callback, returns the human's verdict.
- **Executor:** `PaystackExecutor implements Executor`; creates/uses a transfer recipient and initiates the transfer, returns a reference or a typed failure.

## 10. Data model (sketch)

- **policy**: the JSON in the README, one active version per user, versioned on change.
- **intent**: id, amount, recipient, category, reason, idempotency_key, received_at.
- **decision**: intent_id, verdict, reason, evaluated_at, policy_version.
- **transfer**: decision_id, rail, rail_reference, status, amount, settled_at.
- **audit** view: the join of the above, append-only, human-readable.

Shaping `intent` and `decision` to echo AP2's Intent and Payment Mandates is optional but cheap, and makes a future AP2 adapter a small job rather than a rewrite.

## 11. Milestones (time-scoped)

Target: a focused weekend, roughly 10 to 14 hours. Estimates assume your usual pace and reuse of the KODED OS Telegram bot.

| Phase | Deliverable | Est. | Gate to next phase |
|-------|-------------|------|--------------------|
| **P0 — Core gate** | Decision engine + spend ledger + audit log, fully unit-tested, no real payments | 3–4h | Decisions are correct and idempotent under a concurrency test |
| **P1 — Paystack (test mode)** | Executor wired to Paystack test keys; `allow` triggers a test transfer end to end | 2–3h | A test intent flows intent → decision → test transfer → logged |
| **P2 — Approval loop** | Telegram approval on `needs_approval`, blocking with timeout-to-deny | 2h | Over-cap intent pings phone and honors the reply |
| **P3 — Live cutover (DoD)** | Live keys, ₦2,000 float, allowlisted recipients; move real naira | 1–2h | A real small transfer lands in a real account, gated and logged |
| **P4 — Demo + polish** | Demo script, clean audit view, record the two-minute clip | 2–3h | The full demo runs start to finish on camera |

**One-night MVP cut:** P0 + P1 only. That already gives you a working, idempotent gate moving money in Paystack test mode, which is demoable and is the honest core. P3 is what turns "works" into "moves real naira," and depends on your Paystack live access being sorted.

## 12. Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Live Paystack needs business verification / OTP | Do all dev in test mode; treat live as a config flip once verified |
| Concurrency causes overspend | Atomic Redis decrement + idempotency keys; explicit concurrency test in P0 |
| Scope creep back toward v1 | The kill list in section 4 is the contract; re-read it before adding anything |
| Agent gets manipulated into a bad payment | Recipient allowlist + per-tx cap + human approval threshold contain the damage |
| Key leak | Float ceiling caps loss; secrets in env only; rotate on suspicion |

## 13. Open questions

- Which operation is the primary demo: vendor payout (transfer out), or bill/airtime purchase? Transfer-out is assumed here; airtime would swap the executor call, not the gate.
- Should approvals expire to `deny` (safer) or stay pending (more forgiving)? Defaulting to deny-on-timeout.
- Is a second rail (Squad by GTCO, given the hackathon relationship) worth wiring in P4 as proof of the rail-agnostic claim, or is that a v2 flex?
