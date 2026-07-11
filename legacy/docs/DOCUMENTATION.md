# Janus – AUM-Based Treasury Policy on Solana

Janus is a **Solana Anchor** program that manages a treasury policy where an AI agent can spend only a **percentage of current Assets Under Management (AUM)**. Originally migrated from a SUI Move contract.

## Features

*   **Owner** controls the policy (adds approved protocols).
*   **Agent** (e.g., AI bot) requests spending.
*   **Dynamic spend limit** = `(aum * aum_percentage_bps) / 10000`.
*   **Approved protocols** – agent can only send funds to whitelisted addresses.

## Program ID (Localnet example)
`AZp5LhbF7gesu1N7zeAhiLPGLASYC5rVYqUvyB9uRPi8`

## Account Structure

```rust
pub struct TreasuryPolicy {
    pub owner: Pubkey,
    pub agent: Pubkey,
    pub aum_percentage_bps: u16,   // e.g. 100 = 1%
    pub approved_protocols: [Pubkey; 32],
    pub protocol_count: u8,
}
```

## Instructions

### `create_policy(agent: Pubkey, aum_percentage_bps: u16)`
Initializes a new policy. Only callable once per owner (PDA derived from `"treasury_policy"` + owner key).

### `add_protocol(protocol: Pubkey)`
Owner adds a protocol address to the approved list.

### `check_compliance(amount: u64, aum: u64, target: Pubkey)`
Agent checks if a spend is allowed. Reverts if:
1.  Caller is not the agent.
2.  `amount > (aum * aum_percentage_bps) / 10000`.
3.  `target` is not in the approved list.

## Deployment

```bash
anchor build
anchor program deploy target/deploy/janus_policy.so
```

## Testing (Localnet)

**Start validator:**
```bash
solana-test-validator --reset --rpc-port 8899
```

**Run test script:**
```bash
node test_aum.js
```

### Example Test Output
```text
Creating policy...
Adding protocol...
Checking compliance: amount=500, AUM=100000 (max allowed = 1000)
✅ Compliance passed
✅ Over-limit correctly rejected: OverSpendLimit
All tests passed.
```

## Integration with AI Agent
The agent must:
1.  Obtain current AUM (e.g., from a treasury balance oracle).
2.  Call `check_compliance(amount, aum, target)`.
3.  If successful, execute the transfer (outside the policy contract).

## Security Notes
*   **The AUM parameter is trusted from the agent.** For production, replace with an on-chain AUM account.
*   The percentage is immutable after creation. Use a separate `update_policy` instruction if needed.