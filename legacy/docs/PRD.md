# Product Requirements Document: Janus Protocol (Solana Edition)

## 1. Overview
**Product Name:** Janus Protocol — Autonomous AI Vault Manager  
**Vision:** A zero-trust, AI-native execution layer where autonomous agents safely manage Solana assets using split-key custody and on-chain compliance.

## 2. Problem Statement
AI agents currently face a security paradox:
1. **Full-key risk:** Giving AI complete private key access exposes users to catastrophic loss.
2. **Manual bottleneck:** Requiring human approval for every transaction defeats automation.
3. **Compliance gap:** Autonomous trading often lacks real-time guardrails for risk management.

## 3. Solution: Janus + Drift + Ika Architecture

### Core Components:
1. **Janus Intent Layer** - Natural Language → Machine-Readable Strategies (e.g., Delta-Neutral Basis Trades).
2. **Janus Policy Engine (Solana)** - On-chain compliance judge built with Anchor to enforce spend limits and protocol allow-lists.
3. **Ika MPC Bridge** - Sharded key management for Solana (Ed25519) to ensure the AI never acts alone.
4. **Drift Protocol Integration** - Native perpetual trading and vault management on Solana.

### Technical Stack:
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Intent Parser** | Google Gemini / Claude | Convert "Hedge my ETH" to structured Drift orders |
| **Policy Engine** | Solana Anchor (Rust) | Immutable, on-chain execution rules |
| **Trading Layer** | Drift Protocol V2 | Perp positions and spot hedging |
| **Key Management** | Ika Network MPC | 2-of-2 MPC signing (Agent + Ika) |
| **Automation** | Django Background Worker | Autonomous rebalancing loop |

## 4. Key Features & User Flows

### Feature 1: Basis Trade Automation
**User Story:** "Hedge my spot ETH holdings with a short perp position on Drift."
**Flow:**
1. User defines intent in natural language.
2. AI parses intent into a `BASIS_TRADE` strategy.
3. Janus Bridge constructs an atomic Solana transaction: `[Compliance Check] + [Drift Place Order]`.
4. Ika Network co-signs the transaction.
5. Transaction executes on Solana, maintaining delta-neutrality.

### Feature 2: On-Chain Spend Limits (AUM Protection)
**User Story:** "As a vault owner, I want to ensure my AI agent never trades more than 5% of my AUM in a single transaction."
**Flow:**
1. The `janus_policy` contract is initialized with a 500 bps (5%) limit.
2. Every transaction includes a mandatory call to `check_compliance`.
3. If the AI agent attempts to open a position larger than 5% of the portfolio, the Solana runtime rejects the transaction.

## 5. Technical Implementation (Hackathon Phases)

### Phase 1: Solana Pivot (Completed)
- Ported Move policy engine to Anchor (`janus_policy`).
- Implemented `check_compliance` with AUM-based logic.

### Phase 2: Drift Integration (Completed)
- Built `drift_bridge.js` for atomic transaction construction.
- Integrated Drift V2 instruction layout for perp orders.

### Phase 3: Autonomous Automation (Completed)
- Created `run_agent` background worker to automate rebalancing.
- Wired frontend dashboard to real execution endpoints.

## 6. Security Model
1. **No Single Point of Failure:** Key shards are distributed; the agent only has one share.
2. **On-Chain Guardrails:** The Solana smart contract is the final judge, not the AI.
3. **Atomic Execution:** Compliance checks and trades are bundled in a single transaction.

## 7. Integration Points
```rust
// Solana Policy Check (Anchor)
pub fn check_compliance(ctx: Context<Compliance>, amount: u64, aum: u64) -> Result<()> {
    let limit = aum.checked_mul(policy.bps).unwrap() / 10000;
    if amount > limit {
        return err!(ErrorCode::OverAumSpendLimit);
    }
    Ok(())
}
```
