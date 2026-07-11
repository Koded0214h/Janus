# Janus

> **A programmable trust layer for autonomous payments.**

Janus sits between software and a payment rail, answering one question before money moves:

> **Is this payment allowed?**

Not **can** it be paid. **Should** it be paid.

Everything else is implementation.

---

## Why Janus exists

Software is getting good enough to spend money.

AI agents can already:

* book flights
* order food
* pay invoices
* renew subscriptions
* call APIs

Giving software a way to pay isn't the hard part. Banks already expose APIs. Payment providers already expose APIs.

The difficult problem is authorization. How do you let software spend money...

* only within a budget,
* only for approved categories,
* only to trusted recipients,
* while keeping a complete audit trail,
* and without risking your primary account?

That's the problem Janus solves.

---

## The philosophy

Janus doesn't replace your bank. Janus doesn't replace Paystack. Janus doesn't replace your wallet.

Janus decides whether a payment should happen before it reaches them. Think of it as IAM for money.

```
Software
   │
   ▼
Payment Intent
   │
   ▼
   Janus
   │
   ▼
ALLOW / DENY / ASK
   │
   ▼
Payment Rail
```

That's the entire product.

---

## Core principles

Janus follows four principles.

### 1. Trust is programmable.

Permissions shouldn't live inside application code. They should be policies.

### 2. Money moves through intent.

Software shouldn't call:

```python
pay()
```

It should submit an intent:

```python
{
    amount,
    recipient,
    reason,
    category
}
```

Janus decides the rest.

### 3. The payment rail is replaceable.

Today: Paystack, NIP.

Tomorrow: Stripe, Flutterwave, Squad, Stablecoins, AP2, MPP.

Janus doesn't care.

### 4. Correctness is the product.

Anyone can integrate a payment API. The interesting engineering starts after that:

* atomic budgets
* idempotency
* retries
* race conditions
* deterministic policy evaluation
* auditability

That's where Janus lives.

---

## Architecture

```
                    Payment Intent
                           │
                           ▼
                    Policy Engine
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    Budget Check      Recipient Check    Approval Rules
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                  Authorization Decision
                   ALLOW / DENY / ASK
                           │
                 ┌─────────┴──────────┐
                 ▼                    ▼
         Human Approval        Payment Executor
                                      │
                                      ▼
                                Payment Rail
                                      │
                                      ▼
                               Audit Log
```

---

## Example

An AI assistant wants to pay ₦150 to a known delivery rider.

Janus evaluates:

* ✅ Daily budget available
* ✅ Recipient allow-listed
* ✅ Category allowed
* ✅ Under approval threshold

Decision: **ALLOW**. The payment executes. The audit log records why.

---

The same assistant now attempts to send ₦5,000.

Janus evaluates:

* ❌ Above approval threshold

Decision: **ASK**. A Telegram notification appears. Nothing moves until you approve it.

---

Now it tries sending money to an unknown account.

Decision: **DENY**. The payment never reaches the payment provider.

---

## Features

* Policy-based payment authorization
* Budget enforcement
* Recipient allowlists
* Category restrictions
* Human approval workflows
* Velocity limiting
* Idempotent execution
* Atomic spend accounting
* Immutable audit logs
* Pluggable payment executors

---

## Current implementation

Current payment executor:

* Paystack Transfers
* Nigerian NIP settlement

Planned executors:

* Stripe
* Flutterwave
* Squad
* AP2
* MPP

---

## Tech Stack

* FastAPI
* PostgreSQL
* Redis
* Docker
* Telegram Bot API
* Paystack

---

## Roadmap

### Phase 1

* Policy engine
* Spend ledger
* Paystack executor
* Telegram approvals

### Phase 2

* Pluggable executors
* Multi-user policies
* Web dashboard

### Phase 3

* AP2 support
* MPP support
* Machine identity
* SDKs

---

## Inspiration

Janus was inspired by a simple observation:

> AI doesn't need more ways to pay. It needs better ways to ask permission.

Recent work around Google's **AP2 (Agent Payments Protocol)** and **MPP (Machine Payments Protocol)** points in the same direction: separating **authorization** from **settlement**.

Janus explores that idea today using existing payment rails.

---

## Status

🚧 Early development.

The goal isn't to build another payment gateway. The goal is to build the trust layer that sits in front of one.

See [PRD.md](PRD.md) for the full product requirements and build plan. Earlier Solana/Drift/Ika prototype work has been moved to [`legacy/`](legacy/).
