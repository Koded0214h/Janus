use anchor_lang::prelude::*;
use crate::{
    constants::{POLICY_SEED, MAX_PROTOCOLS, MAX_AUM_PERCENTAGE_BPS},
    error::PolicyError,
    state::TreasuryPolicy,
};

// ────────────────────────────────────────────────────────────────────────────
// create_policy
// ────────────────────────────────────────────────────────────────────────────

/// Accounts for `create_policy`.
///
/// SUI equivalent:
/// ```move
/// public fun create_policy(agent: address, limit: u64, ctx: &mut TxContext)
/// ```
/// In SUI the object was shared via `transfer::share_object(policy)`.
/// On Solana we instead create a PDA owned by the program — no sharing needed;
/// anyone can read it, only the owner or agent can mutate it.
#[derive(Accounts)]
pub struct CreatePolicy<'info> {
    /// The wallet paying rent and becoming the policy owner.
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The TreasuryPolicy PDA.
    /// Seeds: ["treasury_policy", owner.key()]
    /// init creates the account and sets the discriminator.
    #[account(
        init,
        payer = owner,
        space = TreasuryPolicy::SPACE,
        seeds = [POLICY_SEED, owner.key().as_ref()],
        bump
    )]
    pub policy: Account<'info, TreasuryPolicy>,

    pub system_program: Program<'info, System>,
}

/// Instruction handler for `create_policy`.
///
/// # Arguments
/// * `agent`             — public key of the AI agent allowed to call `check_compliance`.
/// * `aum_percentage_bps` — basis points of AUM the agent may spend per tx (1–5 000).
pub fn create_policy(
    ctx: Context<CreatePolicy>,
    agent: Pubkey,
    aum_percentage_bps: u64,
) -> Result<()> {
    require!(
        aum_percentage_bps >= 1 && aum_percentage_bps <= MAX_AUM_PERCENTAGE_BPS,
        PolicyError::InvalidAumPercentage
    );

    let policy = &mut ctx.accounts.policy;
    policy.owner = ctx.accounts.owner.key();
    policy.agent = agent;
    policy.aum_percentage_bps = aum_percentage_bps;
    policy.protocol_count = 0;
    policy.approved_protocols = [Pubkey::default(); 20];
    policy.bump = ctx.bumps.policy;

    msg!(
        "Policy created | owner={} agent={} bps={}",
        policy.owner,
        policy.agent,
        policy.aum_percentage_bps,
    );
    Ok(())
}

// ────────────────────────────────────────────────────────────────────────────
// add_protocol
// ────────────────────────────────────────────────────────────────────────────

/// Accounts for `add_protocol`.
///
/// SUI equivalent:
/// ```move
/// public fun add_protocol(policy: &mut TreasuryPolicy, protocol: address, ctx: &TxContext) {
///     assert!(ctx.sender() == policy.owner, ENotAuthorized);
///     if (!vector::contains(&policy.approved_protocols, &protocol)) {
///         vector::push_back(&mut policy.approved_protocols, protocol);
///     };
/// }
/// ```
#[derive(Accounts)]
pub struct AddProtocol<'info> {
    /// Must be the policy owner.
    pub owner: Signer<'info>,

    /// The policy PDA — must match the owner.
    #[account(
        mut,
        seeds = [POLICY_SEED, owner.key().as_ref()],
        bump = policy.bump,
        has_one = owner @ PolicyError::NotOwner,
    )]
    pub policy: Account<'info, TreasuryPolicy>,
}

/// Instruction handler for `add_protocol`.
///
/// Idempotent: if the protocol is already approved the tx succeeds but does not
/// duplicate the entry (mirrors SUI's `if (!vector::contains(...))`).
pub fn add_protocol(ctx: Context<AddProtocol>, protocol: Pubkey) -> Result<()> {
    let policy = &mut ctx.accounts.policy;

    // Idempotent guard — already approved
    if policy.is_protocol_approved(&protocol) {
        msg!("Protocol {} already approved — no-op", protocol);
        return Ok(());
    }

    require!(
        (policy.protocol_count as usize) < MAX_PROTOCOLS,
        PolicyError::ProtocolListFull
    );

    let idx = policy.protocol_count as usize;
    policy.approved_protocols[idx] = protocol;
    policy.protocol_count += 1;

    msg!(
        "Protocol added | protocol={} total={}",
        protocol,
        policy.protocol_count,
    );
    Ok(())
}

// ────────────────────────────────────────────────────────────────────────────
// check_compliance
// ────────────────────────────────────────────────────────────────────────────

/// Accounts for `check_compliance`.
///
/// SUI equivalent:
/// ```move
/// public fun check_compliance(
///     policy: &TreasuryPolicy,
///     amount: u64,
///     target: address,
///     ctx: &TxContext,
/// ) {
///     assert!(ctx.sender() == policy.agent_address, ENotAuthorized);
///     assert!(amount <= policy.max_spend_limit, EOverSpendLimit);
///     assert!(vector::contains(&policy.approved_protocols, &target), ENotAuthorized);
/// }
/// ```
///
/// Key change: the policy is read-only here (no mutation), and the spend cap
/// is computed dynamically from the `aum` argument.
#[derive(Accounts)]
pub struct CheckCompliance<'info> {
    /// Must be the registered AI agent.
    pub agent: Signer<'info>,

    /// Policy PDA — derive via [POLICY_SEED, owner].
    /// The client must pass the correct owner pubkey to locate the right PDA.
    #[account(
        seeds = [POLICY_SEED, policy.owner.as_ref()],
        bump = policy.bump,
        has_one = agent @ PolicyError::NotAgent,
    )]
    pub policy: Account<'info, TreasuryPolicy>,
}

/// Instruction handler for `check_compliance`.
///
/// The AI agent calls this before every spend to prove the transaction is
/// within policy.  The agent is responsible for supplying the current `aum`.
///
/// # Arguments
/// * `amount`  — the amount the agent intends to spend (in lamports or any token unit).
/// * `aum`     — current Assets Under Management in the same unit as `amount`.
/// * `target`  — the protocol address the funds will be sent to.
pub fn check_compliance(
    ctx: Context<CheckCompliance>,
    amount: u64,
    aum: u64,
    target: Pubkey,
) -> Result<()> {
    let policy = &ctx.accounts.policy;

    // Guard: AUM must be non-zero (otherwise limit = 0 which is always false)
    require!(aum > 0, PolicyError::ZeroAum);

    // Dynamic spend limit: max_allowed = aum * bps / 10_000
    let max_allowed = policy.max_allowed(aum);

    require!(amount <= max_allowed, PolicyError::OverAumSpendLimit);

    require!(policy.is_protocol_approved(&target), PolicyError::ProtocolNotApproved);

    msg!(
        "Compliance OK | amount={} max_allowed={} aum={} target={}",
        amount,
        max_allowed,
        aum,
        target,
    );
    Ok(())
}