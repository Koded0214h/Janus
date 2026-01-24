# Product Requirements Document: Janus Protocol on Ika Network (Sui)

## 1. Overview
**Product Name:** Janus Protocol x Ika Network Integration  
**Vision:** A zero-trust, AI-native execution layer where autonomous agents can safely manage multi-chain assets using split-key custody, governed by human-readable intent policies.

## 2. Problem Statement
AI agents currently face a security paradox:
1. **Full-key risk:** Giving AI complete private key access exposes users to catastrophic loss
2. **Manual bottleneck:** Requiring human approval for every transaction defeats automation
3. **Chain fragmentation:** Managing assets across multiple chains requires complex bridging and separate policies
4. **Privacy-compliance gap:** Accessing institutional DeFi requires sacrificing wallet privacy

## 3. Solution: Janus + Ika Architecture

### Core Components:
1. **Janus Intent Layer** - Natural Language → Machine-Readable Policies
2. **Ika dWallet** - Decentralized Multi-Chain MPC Wallet
3. **Sui Policy Engine** - On-chain intent validation via Move smart contracts
4. **zkLogin** - Privacy-preserving user authentication

### Technical Stack:
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Intent Parser** | LangGraph + LLM (Claude/Swarm) | Convert "If price > X, sell Y%" to structured rules |
| **Policy Store** | Sui Move Contracts | Immutable, on-chain execution rules |
| **Key Management** | Ika 2PC-MPC Network | Distributed key shards (100+ nodes) |
| **Identity** | Sui zkLogin + Quadrata/EAS | Prove humanity without doxxing |
| **Execution** | Ika Omnichain Engine | Native cross-chain transactions without bridges |

## 4. Key Features & User Flows

### Feature 1: Intent-Based Policy Creation
**User Story:** "As a user, I want to set rules in plain English that my AI agent must follow"

**Flow:**
1. User logs in via zkLogin (Google/Apple account)
2. Types: "Keep 50% of my portfolio in BTC, 30% in ETH, and 20% in SUI"
3. Janus LLM parses this into:
   - Rebalancing threshold: ±5%
   - Allowed protocols: Aave, Compound, Uniswap
   - Max slippage: 0.5%
   - Gas budget: $20/month
4. Policy deployed as Move contract on Sui

### Feature 2: Autonomous Execution with MPC Guardrails
**User Story:** "As a user, I want my agent to execute trades automatically within my rules"

**Flow:**
1. Janus agent detects BTC price increase → portfolio now 55% BTC
2. Agent proposes rebalancing transaction (sell 5% BTC, buy ETH/SUI)
3. Agent presents its key share to Ika network
4. Ika nodes query Sui Policy Contract:
   - Is this protocol allowed? ✓
   - Is amount within limits? ✓
   - Is recipient approved? ✓
5. Ika provides second key share
6. Transaction signed & broadcast natively to BTC/ETH/SUI chains

### Feature 3: Emergency Circuit Breaker
**User Story:** "As a user, I want automatic protection when protocols get hacked"

**Flow:**
1. Janus monitors Twitter/Discord/security feeds
2. Detects "critical vulnerability" announcement for Protocol X
3. Immediately proposes withdrawal of all funds
4. Ika validates against emergency policy: "Withdraw from compromised protocols"
5. Funds moved to hardware wallet address (pre-set in policy)

### Feature 4: Institutional Access with Privacy
**User Story:** "As a user, I want to access KYC-only DeFi pools without exposing my identity"

**Flow:**
1. Janus identifies high-yield private credit pool requiring KYC
2. Generates zk-proof via Quadrata: "Proves human + accredited status"
3. Presents proof to pool (no wallet history exposed)
4. Agent executes deposit with MPC signature
5. Pool sees "verified human agent" without doxxing user

## 5. Technical Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
**Deliverables:**
- Janus intent parser (Python/LangGraph)
- Basic Sui Move policy contract (allow/deny lists, amount limits)
- Ika dWallet creation via SDK
- CLI for manual transaction approval

**Success Metric:** User can set policy and manually approve agent actions

### Phase 2: MPC Automation (Weeks 5-8)
**Deliverables:**
- Ika network integration for automatic co-signing
- Policy validation middleware on Ika nodes
- Multi-chain execution (Sui → Ethereum testnet)
- Web dashboard for policy management

**Success Metric:** $5 automated cross-chain transfer via AI intent

### Phase 3: Privacy & Compliance (Weeks 9-12)
**Deliverables:**
- zkLogin integration for authentication
- Quadrata/EAS integration for zk-proofs
- Institutional pool testnet integration
- Privacy-preserving compliance reporting

**Success Metric:** Agent accesses KYC pool without exposing user identity

### Phase 4: Production Ready (Weeks 13-16)
**Deliverables:**
- Multi-chain support (BTC, ETH, SOL, SUI)
- Social sentiment monitoring
- Circuit breaker implementation
- Insurance fund integration
- Mainnet launch

**Success Metric:** Full autonomous treasury management across 3+ chains

## 6. Security Model

### Key Properties:
1. **No Single Point of Failure:** Key shards distributed across 100+ Ika nodes
2. **Policy Immutability:** Rules stored on Sui blockchain (tamper-proof)
3. **Principle of Least Privilege:** Agent only has 1 key share, cannot act alone
4. **Transparent Verification:** All policies publicly auditable on-chain
5. **Graceful Degradation:** If Ika nodes offline, manual override available

### Attack Surface Mitigation:
| Threat | Mitigation |
|--------|------------|
| **Agent Compromise** | Agent only has 1 key share; cannot sign alone |
| **Ika Node Collusion** | Requires >⅔ nodes colluding (economically infeasible) |
| **Policy Exploit** | Time-locked policy changes (48-hour delay for major changes) |
| **Front-running** | MEV protection via Ika's secure execution environment |

## 7. Success Metrics

### Primary KPIs:
1. **Security:** 0 funds lost to agent compromise in first 6 months
2. **Speed:** Intent → Execution < 3 seconds (leveraging Sui's sub-second finality)
3. **Adoption:** 1,000 active users in first 3 months
4. **Assets Under Management:** $10M TVL in first 6 months

### User Experience Goals:
- Onboarding: < 2 minutes from signup to first intent
- Policy creation: Natural language only, no coding required
- Transparency: Real-time dashboard showing all agent actions
- Control: One-click pause/terminate agent access

## 8. Integration Points with Ika/Sui

### Ika Network Integration:
```typescript
// Example integration
const ikaWallet = await Ika.createDWallet({
  network: 'sui',
  threshold: 2, // 2-of-2 MPC
  shares: [
    { holder: 'janus-agent', location: 'secure-enclave' },
    { holder: 'ika-network', location: 'distributed-nodes' }
  ]
});

// Transaction flow
const tx = await janusAgent.proposeTransaction(intent);
const isValid = await suiPolicyContract.validate(tx);
if (isValid) {
  await ikaWallet.cosign(tx); // Ika provides second signature
}
```

### Sui Move Contracts:
```move
module janus::policy {
  struct UserPolicy {
    id: UID,
    max_daily_limit: u64,
    allowed_protocols: vector<address>,
    emergency_withdraw_address: address,
    circuit_breakers: vector<CircuitBreaker>
  }
  
  public fun validate_transaction(
    policy: &UserPolicy,
    tx: Transaction
  ): bool {
    // Check all policy conditions
    tx.amount <= policy.max_daily_limit &&
    contains(&policy.allowed_protocols, tx.protocol) &&
    ...
  }
}
```

## 9. Go-to-Market Strategy

### Target Users:
1. **Crypto-Native Individuals:** Automated portfolio management
2. **DAO Treasuries:** Multi-sig replacement with policy-based automation
3. **Family Offices:** Institutional-grade DeFi with privacy
4. **Protocol Treasuries:** Automated liquidity management

### Launch Plan:
- **Alpha:** 50 whitelisted users (developers/security researchers)
- **Beta:** 500 users from partner communities
- **Mainnet:** Public launch with $1M bug bounty program

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Ika network failure** | Low | High | Fallback to manual signing via hardware wallet |
| **LLM misinterpretation** | Medium | Medium | Multi-LLM consensus + human confirmation for large transactions |
| **Regulatory uncertainty** | High | Medium | Jurisdiction-aware policies + legal counsel |
| **New attack vectors** | Medium | High | $5M insurance fund + time-locked large withdrawals |

## 11. Future Roadmap

### Q3 2024:
- Support for additional chains (Avalanche, Polygon, Arbitrum)
- Advanced intent types (options, derivatives, leveraged positions)
- Agent marketplace (users can subscribe to expert-made policies)

### Q4 2024:
- Mobile app with biometric authentication
- Fiat on/off ramps integrated into intents
- Institutional API for hedge funds/family offices

### Q1 2025:
- Cross-agent coordination (multiple agents managing complex strategies)
- AI-powered policy optimization
- Formal verification of intent policies

## 12. Conclusion

The Janus + Ika integration creates a new paradigm for autonomous asset management: **Intelligent enough to maximize returns, constrained enough to prevent catastrophe.** By combining Sui's high-performance blockchain, Ika's decentralized key management, and Janus's natural language interface, we enable the first truly trustworthy AI financial agents.

This PRD outlines a phased approach to building what could become the standard execution layer for the agentic economy—where AI works for humans, not the other way around.