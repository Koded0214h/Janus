# Janus Protocol

> **The Secure Transaction Layer for the Agentic Web.**

**Janus** is an AI-native execution framework that empowers users to automate complex on-chain transactions without sacrificing custody or privacy. By combining **Natural Language Intents** with **Sharded Key Management**, Janus ensures that your AI assistant is powerful enough to grow your wealth, but too restricted to steal it.

---

## 🌟 The Core Innovation

Most AI bots require you to give them your full private key—one hack, and you lose everything. **Janus** changes the game:

1. **AI Assistant (The Brain):** Executes trades, finds yield, and manages gas.
2. **Sharded Sentry (The Bodyguard):** Your key is split. The AI only has one piece. It literally *cannot* move funds unless it follows the specific "Intent Rules" you set.
3. **ZK-Passport (The ID):** Your agent proves it belongs to a verified human, allowing it into "Institutional-only" DeFi pools while keeping your real name hidden.

---

## 📖 Real-World Scenarios

### Scenario A: The "Set and Forget" Yield Hunter

* **User Intent:** *"Janus, monitor my wallet. If I have more than $500 in idle USDC, move the excess into the safest RWA (Real World Asset) treasury pool paying at least 4.5% APY."*
* **Janus Action:** The agent scans protocols like **Ondu** or **BlackRock’s BUIDL**. It finds a match, calculates the gas, and uses its **Shard B** to propose the trade.
* **Security Check:** The **Sharded Sentry** checks your policy: *"Is this to a verified RWA pool? Yes. Is it under the $1k limit? Yes."* The transaction is signed and executed autonomously while you sleep.

### Scenario B: The "Emergency Circuit Breaker"

* **The Threat:** A DeFi protocol you are using gets a "security alert" on Twitter.
* **Janus Action:** Janus detects the alert via its social-sentiment engine.
* **The Execution:** It immediately pulls your funds out of the risky protocol and moves them to your hardware wallet.
* **The Result:** You saved your capital before you even saw the news notification.

### Scenario C: The "Institutional Passport"

* **The Hurdle:** You want to join a high-yield "Private Credit" pool that requires KYC (Know Your Customer). You don't want to dox your wallet to a random dapp.
* **Janus Action:** Janus presents a **Zero-Knowledge Proof (ZK-Proof)**.
* **The Result:** The protocol sees a "Valid Human" signal and lets the agent in. Your identity remains private, but your agent is treated like a VIP.

---

## 🏗️ Technical Architecture

| Component | Responsibility | Tech Stack |
| --- | --- | --- |
| **Logic Layer** | LLM-based Intent Parsing | Python / LangGraph |
| **Identity Layer** | ZK-Proof Generation (KYA) | Quadrata / EAS |
| **Security Layer** | Threshold Key Sharding | Lit Protocol |
| **Execution Layer** | Programmable Smart Accounts | ERC-4337 (Base/Eth) |

---

## 🚀 Quick Start (Alpha)

### 1. Installation

```bash
git clone https://github.com/yourname/janus-protocol.git
cd janus-protocol
npm install && pip install -r requirements.txt

```

### 2. Configure Your Intent Policy

Edit `policies.json` to define what your AI is allowed to do:

```json
{
  "max_transaction_value": "500 USD",
  "allowed_protocols": ["Aave", "Uniswap", "Ondu"],
  "emergency_withdraw_address": "0xYourHardwareWallet..."
}

```

### 3. Launch Janus

```bash
python main.py --mode autonomous

```

---

## 🛡️ Security Disclosure

Janus is built on the principle of **Principle of Least Privilege**. The AI agent is an *operator*, not an *owner*. Even in the event of a full server compromise, the attacker cannot bypass the **Sharded Sentry** to drain your funds to an unapproved address.

---

## 🤝 Contact & Contributions

Janus is currently in **private alpha**. We are looking for researchers in ZK-Proofs and Agentic Workflows to help us scale the trust layer of the internet.

* **Developer:** [Your Name / Alias]
* **Identity:** `kodedthecoder.eth`
* **Project Site:** `janus.network` (Coming Soon)
