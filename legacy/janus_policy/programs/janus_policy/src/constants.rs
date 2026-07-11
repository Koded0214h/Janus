/// Seed used to derive the TreasuryPolicy PDA.
/// Seeds: [POLICY_SEED, owner.key().as_ref()]
pub const POLICY_SEED: &[u8] = b"treasury_policy";

/// Maximum number of approved protocols the policy can hold.
/// Used for account space calculation.
/// Increase this before deploy if you need more.
pub const MAX_PROTOCOLS: usize = 20;

/// Basis-points denominator (10 000 bps = 100%).
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Hard cap: the `aum_percentage_bps` argument can never exceed this value.
/// 5 000 bps == 50% of AUM — a sane upper bound for an AI agent.
pub const MAX_AUM_PERCENTAGE_BPS: u64 = 5_000;