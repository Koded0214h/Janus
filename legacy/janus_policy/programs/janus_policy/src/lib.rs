/*
 * janus_policy — Anchor (Solana) migration of janus_core::policy (SUI Move)
 *
 * Migration summary
 * ─────────────────
 * SUI concept            → Solana / Anchor equivalent
 * ─────────────────────────────────────────────────
 * shared object (UID)    → PDA  (seeds: ["treasury_policy", owner])
 * TxContext.sender()     → Signer account validated via has_one / Signer<'info>
 * max_spend_limit (fixed)→ aum_percentage_bps (dynamic: spend = aum * bps / 10_000)
 * ENotAuthorized         → PolicyError::NotOwner / NotAgent / ProtocolNotApproved
 * EOverSpendLimit        → PolicyError::OverAumSpendLimit
 * transfer::share_object → no equivalent needed — PDA is world-readable
 */

 use anchor_lang::prelude::*;

 pub mod constants;
 pub mod error;
 pub mod instructions;
 pub mod state;
 
 use instructions::*;
 
 // ── Program ID ───────────────────────────────────────────────────────────────
 // This is a placeholder ID for local development.
 // After running `anchor keys generate` or `anchor build`, replace this with
 // the actual program ID printed by the CLI.
 // The Anchor.toml [programs.localnet] entry must match this value.
 declare_id!("AZp5LhbF7gesu1N7zeAhiLPGLASYC5rVYqUvyB9uRPi8");
 
 // ── Program module ───────────────────────────────────────────────────────────
 #[program]
 pub mod janus_policy {
     use super::*;
 
     /// Create a new TreasuryPolicy PDA.
     ///
     /// SUI equivalent: `create_policy(agent, limit, ctx)`
     /// Difference: `limit` (fixed u64) → `aum_percentage_bps` (dynamic, 1–5 000 bps).
     pub fn create_policy(
         ctx: Context<CreatePolicy>,
         agent: Pubkey,
         aum_percentage_bps: u64,
     ) -> Result<()> {
         instructions::create_policy(ctx, agent, aum_percentage_bps)
     }
 
     /// Add a protocol address to the approved list.
     ///
     /// SUI equivalent: `add_protocol(policy, protocol, ctx)`
     /// Only the policy owner may call this (enforced via `has_one = owner`).
     pub fn add_protocol(ctx: Context<AddProtocol>, protocol: Pubkey) -> Result<()> {
         instructions::add_protocol(ctx, protocol)
     }
 
     /// Verify that a proposed spend is within policy.
     ///
     /// SUI equivalent: `check_compliance(policy, amount, target, ctx)`
     /// Only the registered AI agent may call this (enforced via `has_one = agent`).
     ///
     /// The spend cap is now DYNAMIC: max_allowed = aum * aum_percentage_bps / 10_000
     /// The agent must pass the current AUM on every call.
     pub fn check_compliance(
         ctx: Context<CheckCompliance>,
         amount: u64,
         aum: u64,
         target: Pubkey,
     ) -> Result<()> {
         instructions::check_compliance(ctx, amount, aum, target)
     }
 }