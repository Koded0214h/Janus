use anchor_lang::prelude::*;

#[error_code]
pub enum PolicyError {
    /// Caller is not the authorised agent (mirrors SUI ENotAuthorized = 0).
    #[msg("Caller is not the authorised agent")]
    NotAgent,

    /// Caller is not the policy owner.
    #[msg("Caller is not the policy owner")]
    NotOwner,

    /// Computed max spend (AUM * bps / 10 000) is less than the requested amount.
    #[msg("Requested amount exceeds the AUM-derived spend limit")]
    OverAumSpendLimit,

    /// Target protocol is not on the approved list.
    #[msg("Target protocol address is not approved")]
    ProtocolNotApproved,

    /// aum_percentage_bps is 0 or above MAX_AUM_PERCENTAGE_BPS.
    #[msg("aum_percentage_bps must be between 1 and 5 000")]
    InvalidAumPercentage,

    /// AUM value passed to check_compliance is zero (would make limit = 0).
    #[msg("AUM must be greater than zero")]
    ZeroAum,

    /// Protocol list is already full (MAX_PROTOCOLS reached).
    #[msg("Approved protocol list is full")]
    ProtocolListFull,

    /// Protocol is already in the approved list (idempotent guard).
    #[msg("Protocol is already approved")]
    ProtocolAlreadyApproved,
}