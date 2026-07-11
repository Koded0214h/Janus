use anchor_lang::prelude::*;
use crate::constants::{MAX_PROTOCOLS, BPS_DENOMINATOR};

/// On-chain representation of the Janus treasury policy.
///
/// SUI Move equivalent:
/// ```move
/// public struct TreasuryPolicy has key, store {
///     id: UID,
///     owner: address,
///     agent_address: address,
///     max_spend_limit: u64,           // ← REMOVED; replaced by aum_percentage_bps
///     approved_protocols: vector<address>,
/// }
/// ```
///
/// Migration changes:
/// - `max_spend_limit` is gone.  Spend limit is now DYNAMIC:
///   `max_allowed = (aum * aum_percentage_bps) / 10_000`
/// - Account is a PDA (seeds: ["treasury_policy", owner]).
///   Replaces SUI's shared-object pattern.
#[account]
pub struct TreasuryPolicy {
    /// The wallet that created and administers this policy.
    /// Mirrors SUI `owner`.
    pub owner: Pubkey,

    /// The AI agent allowed to call `check_compliance`.
    /// Mirrors SUI `agent_address`.
    pub agent: Pubkey,

    /// How many basis points of the current AUM the agent may spend per call.
    /// Example: 100 bps = 1%.  Range: 1 – 5 000.
    pub aum_percentage_bps: u64,

    /// Number of entries currently in `approved_protocols`.
    pub protocol_count: u8,

    /// Fixed-capacity list of approved protocol addresses.
    /// Mirrors SUI `approved_protocols: vector<address>`.
    /// Padded to MAX_PROTOCOLS (20) at init time for predictable account size.
    pub approved_protocols: [Pubkey; 20], // MAX_PROTOCOLS must match constant

    /// Canonical bump for this PDA — stored so callers never have to re-derive.
    pub bump: u8,
}

impl TreasuryPolicy {
    /// Discriminator (8) + owner (32) + agent (32) + aum_percentage_bps (8)
    /// + protocol_count (1) + approved_protocols (20 * 32) + bump (1)
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 1 + (MAX_PROTOCOLS * 32) + 1;

    /// Returns the dynamic spend limit for a given AUM value.
    pub fn max_allowed(&self, aum: u64) -> u64 {
        // Integer arithmetic — no floating point on Solana.
        // aum * bps / 10_000
        (aum as u128)
            .saturating_mul(self.aum_percentage_bps as u128)
            .checked_div(BPS_DENOMINATOR as u128)
            .unwrap_or(0) as u64
    }

    /// Check if `addr` is in the approved list.
    pub fn is_protocol_approved(&self, addr: &Pubkey) -> bool {
        let count = self.protocol_count as usize;
        self.approved_protocols[..count].contains(addr)
    }
}