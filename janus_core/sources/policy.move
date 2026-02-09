module janus_core::policy {
    // These are now auto-imported, but we'll keep only what's unique
    // Removed duplicate 'use' lines

    // === Errors ===
    const ENotAuthorized: u64 = 0;
    const EOverSpendLimit: u64 = 1;

    // === The Policy Object ===
    public struct TreasuryPolicy has key, store {
        id: UID,
        owner: address,
        max_spend_limit: u64,
        approved_protocols: vector<address>,
    }

    // 1. Create a new policy
    public fun create_policy(limit: u64, ctx: &mut TxContext) {
        let policy = TreasuryPolicy {
            id: object::new(ctx),
            owner: ctx.sender(), // Modern syntax: .sender() instead of tx_context::sender(ctx)
            max_spend_limit: limit,
            approved_protocols: vector::empty<address>(),
        };
        transfer::share_object(policy);
    }

    // 2. Add an approved protocol
    public fun add_protocol(policy: &mut TreasuryPolicy, protocol: address, ctx: &mut TxContext) {
        assert!(ctx.sender() == policy.owner, ENotAuthorized);
        policy.approved_protocols.push_back(protocol);
    }

    // 3. The check called by Ika/Sentry
    public fun check_compliance(policy: &TreasuryPolicy, amount: u64, target: address) {
        assert!(amount <= policy.max_spend_limit, EOverSpendLimit);
        assert!(policy.approved_protocols.contains(&target), ENotAuthorized);
    }
}