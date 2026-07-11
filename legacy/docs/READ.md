# Janus: Your Secure Solana Assistant

> **The smart assistant that grows your wealth on Drift, keeps your secrets, and protects your money.**

### 🧐 What is Janus?

Imagine you had a highly skilled personal assistant who could manage your Solana investments—like finding the best funding rates on Drift or keeping your portfolio balanced—without ever having the power to steal your funds.

**Janus** is that assistant. Built for the Ranger Hackathon, Janus uses AI to execute complex trading strategies while being physically locked down by Solana smart contracts.

---

## 🌟 Why should you care?

### 1. You set the rules. Janus does the work.
Instead of manually checking funding rates and opening short positions to hedge your spot, you just tell Janus: *"Keep me delta-neutral on ETH using Drift."* Janus watches the market 24/7 and moves your money only when it follows your safety rules.

### 2. The "Unbreakable" Safety Lock
Most trading bots are like giving someone the only key to your house. Janus uses **"Key Splitting"** via the Ika Network:
*   One piece stays with the Janus AI.
*   One piece stays with the Ika Network.
**Why this matters:** Even if the Janus server is hacked, the attacker cannot touch your money because they don't have the Ika co-signature.

### 3. On-Chain Compliance
Janus isn't just "trusted" to be good—it is **forced** to be good. Every trade it makes is checked by the `janus_policy` program on Solana. If Janus tries to move more than you allowed (e.g., more than 5% of your total value), the Solana network itself will block the trade.

---

## 🚀 Everyday Scenarios

| If you want to... | Janus helps by... |
| --- | --- |
| **Capture Funding Rates** | Automatically opening short perp positions on **Drift** to hedge your spot holdings. |
| **Stop Overspending** | Setting an on-chain "Spend Limit." The AI can never trade more than your allowed threshold. |
| **Handle Market Volatility** | Rebalancing your hedges automatically when prices move, without you needing to sign every transaction. |

---

## 🛠️ How do I use it?

You talk to Janus in **Plain English**.

1.  **Connect:** Link your Solana wallet.
2.  **Tell:** Say what you want (e.g., *"Hedge my SOL with Drift perps"*).
3.  **Set Limits:** Define your max trade size (e.g., "5% of AUM").
4.  **Relax:** Janus runs in the background and keeps your portfolio exactly where you want it.

---

## 🔒 The Janus Promise

*   **Non-Custodial:** Janus never has full control of your keys.
*   **On-Chain Auditable:** Every rule is a smart contract, not just a promise.
*   **User-First:** You can pause or terminate the AI agent with a single click.
