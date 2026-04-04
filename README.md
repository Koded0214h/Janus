# Janus Protocol — Solana Vault Manager

> **The Secure Execution Layer for Autonomous Agents on Solana.**

**Janus** is an AI-native execution framework designed for the Ranger Hackathon. It enables users to deploy autonomous trading bots that manage complex strategies—like Delta-Neutral Basis Trades on Drift Protocol—while ensuring on-chain compliance and sharded key security.

---

## 🌟 The Core Innovation: Solana Pivot

Most AI bots require full private key access. Janus changes this by splitting the key and enforcing rules on-chain:

1.  **AI Strategist (Gemini/Claude):** Generates high-alpha execution plans (e.g., "Short ETH-PERP on Drift to hedge spot holdings").
2.  **Solana Policy Engine (Anchor):** An on-chain "Judge" that validates every trade against AUM-based spend limits.
3.  **MPC Sharded Sentry (Ika Network):** Your Solana key is sharded. The AI literally cannot move funds without an atomic compliance check and a co-signature from the Ika network.

---

## 📖 Hackathon Use Case: Delta-Neutral Basis Trader

*   **User Intent:** *"Maintain a delta-neutral position on my ETH. Short perps on Drift whenever I buy spot to capture funding rates."*
*   **Janus Action:** The agent scans Drift perp markets and Jupiter spot prices. It constructs a single, atomic Solana transaction.
*   **Compliance Check:** The `janus_policy` program checks: *"Is this trade within 5% of AUM? Yes. Is Drift an approved protocol? Yes."*
*   **Execution:** The transaction is signed via MPC and executed on-chain.

---

## 🏗️ Technical Architecture

| Layer | Responsibility | Tech Stack |
| --- | --- | --- |
| **Strategy Layer** | Intent Parsing & Planning | Python / Gemini 2.0 |
| **Trading Layer** | Perpetual & Spot Integration | Drift V2 / Jupiter |
| **Enforcement Layer** | On-Chain Compliance | Solana / Anchor |
| **Security Layer** | Threshold Key Management | Ika Network (Ed25519) |

---

## 🚀 Deployment (Quick Start)

See `DEPLOY.md` for full instructions.

1.  **Deploy Contract:** `cd janus_policy && anchor deploy`
2.  **Start Bridges:** `node bridge/ika_bridge.js` & `node bridge/drift_bridge.js`
3.  **Run Agent:** `python manage.py run_agent --interval 60`

---

## 🛡️ Security Disclosure

Janus follows the **Principle of Least Privilege**. The AI agent is an *operator*, not an *owner*. On-chain logic prevents any trade that deviates from user-defined safety parameters.

---

## 🤝 Ranger Hackathon Submission
*   **Track:** Main Track (Vault Strategies)
*   **Side Track:** Drift Side Track (Native Perp Integration)
*   **Developer:** kodedthecoder
