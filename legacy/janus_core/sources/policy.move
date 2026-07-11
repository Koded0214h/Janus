module janus_core::policy {
    // These are now part of the default "prelude" in Sui Move 2024
    // so we don't need to explicitly 'use' UID or TxContext anymore.

    // === Errors ===
    const ENotAuthorized: u64 = 0;
    const EOverSpendLimit: u64 = 1;

    // === The Policy Object ===
    public struct TreasuryPolicy has key, store {
        id: UID,
        owner: address,
        agent_address: address, 
        max_spend_limit: u64,
        approved_protocols: vector<address>,
    }

    public fun create_policy(agent: address, limit: u64, ctx: &mut TxContext) {
        let policy = TreasuryPolicy {
            id: object::new(ctx),
            owner: ctx.sender(),
            agent_address: agent,
            max_spend_limit: limit,
            approved_protocols: vector::empty<address>(),
        };
        transfer::share_object(policy);
    }

    public fun add_protocol(policy: &mut TreasuryPolicy, protocol: address, ctx: &TxContext) {
        assert!(ctx.sender() == policy.owner, ENotAuthorized);
        if (!vector::contains(&policy.approved_protocols, &protocol)) {
            vector::push_back(&mut policy.approved_protocols, protocol);
        };
    }

    public fun check_compliance(policy: &TreasuryPolicy, amount: u64, target: address, ctx: &TxContext) {
        assert!(ctx.sender() == policy.agent_address, ENotAuthorized);
        assert!(amount <= policy.max_spend_limit, EOverSpendLimit);
        assert!(vector::contains(&policy.approved_protocols, &target), ENotAuthorized);
    }
}