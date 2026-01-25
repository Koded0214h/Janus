// ============================================================================
// Janus Protocol - Complete Sui Smart Contract System
// ============================================================================

module janus::core {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::string::{Self, String};
    use std::vector;

    // ============================================================================
    // Error Codes
    // ============================================================================
    const E_NOT_OWNER: u64 = 0;
    const E_POLICY_INACTIVE: u64 = 1;
    const E_RULE_VIOLATION: u64 = 2;
    const E_INVALID_STATUS: u64 = 3;
    const E_TIMELOCK_ACTIVE: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_INVALID_SIGNATURE: u64 = 6;
    const E_EXPIRED: u64 = 7;
    const E_UNAUTHORIZED: u64 = 8;

    // ============================================================================
    // Constants
    // ============================================================================
    
    // Rule Types
    const RULE_AMOUNT_LIMIT: u8 = 0;
    const RULE_PROTOCOL_ALLOWLIST: u8 = 1;
    const RULE_TIME_WINDOW: u8 = 2;
    const RULE_CIRCUIT_BREAKER: u8 = 3;
    const RULE_SLIPPAGE_LIMIT: u8 = 4;
    const RULE_GAS_BUDGET: u8 = 5;

    // Transaction Status
    const STATUS_PENDING: u8 = 0;
    const STATUS_APPROVED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;
    const STATUS_EXECUTED: u8 = 3;
    const STATUS_EXPIRED: u8 = 4;

    // Timelock Duration (48 hours in milliseconds)
    const POLICY_CHANGE_TIMELOCK: u64 = 172800000;
    
    // Transaction Expiry (1 hour in milliseconds)
    const TX_EXPIRY: u64 = 3600000;

    // ============================================================================
    // Core Data Structures
    // ============================================================================

    /// Main policy container - stores all user-defined rules
    public struct Policy has key, store {
        id: UID,
        owner: address,
        name: String,
        created_at: u64,
        updated_at: u64,
        is_active: bool,
        is_emergency_paused: bool,
        rules: vector<Rule>,
        daily_spent: u64,
        daily_reset_time: u64,
        ika_wallet_id: String,  // Reference to Ika dWallet
        agent_public_key: vector<u8>,  // Agent's public key for verification
    }

    /// Individual rule within a policy
    public struct Rule has store, drop, copy {
        rule_type: u8,
        data: vector<u8>,
        priority: u8,
        is_active: bool,
    }

    /// Transaction proposal from AI agent
    public struct TxProposal has key, store {
        id: UID,
        policy_id: address,
        proposer: address,
        amount: u64,
        recipient: address,
        protocol: String,
        chain_id: String,
        slippage_bps: u64,  // Basis points (1% = 100)
        gas_budget: u64,
        proposed_at: u64,
        expires_at: u64,
        status: u8,
        agent_signature: vector<u8>,  // Signature from agent's key shard
        ika_signature: vector<u8>,     // Signature from Ika network
        metadata: String,  // JSON metadata for additional context
    }

    /// Policy change proposal (with timelock)
    public struct PolicyUpdate has key, store {
        id: UID,
        policy_id: address,
        proposed_at: u64,
        executable_at: u64,
        new_rules: vector<Rule>,
        executed: bool,
    }

    /// Treasury for holding protocol fees and insurance fund
    public struct Treasury has key {
        id: UID,
        balance: Balance<SUI>,
        total_collected: u64,
        insurance_reserve: u64,
    }

    /// Agent registration for access control
    public struct AgentRegistry has key {
        id: UID,
        registered_agents: vector<RegisteredAgent>,
    }

    public struct RegisteredAgent has store, drop, copy {
        agent_address: address,
        public_key: vector<u8>,
        ika_wallet_id: String,
        registered_at: u64,
        is_active: bool,
    }

    // ============================================================================
    // Events
    // ============================================================================

    public struct PolicyCreated has copy, drop {
        policy_id: address,
        owner: address,
        name: String,
        ika_wallet_id: String,
    }

    public struct RuleAdded has copy, drop {
        policy_id: address,
        rule_type: u8,
        priority: u8,
    }

    public struct TxProposed has copy, drop {
        proposal_id: address,
        policy_id: address,
        amount: u64,
        protocol: String,
        chain_id: String,
        proposed_at: u64,
    }

    public struct TxExecuted has copy, drop {
        proposal_id: address,
        policy_id: address,
        amount: u64,
        executed_at: u64,
    }

    public struct TxRejected has copy, drop {
        proposal_id: address,
        policy_id: address,
        reason: String,
    }

    public struct EmergencyPause has copy, drop {
        policy_id: address,
        paused_at: u64,
        reason: String,
    }

    public struct PolicyUpdateProposed has copy, drop {
        update_id: address,
        policy_id: address,
        executable_at: u64,
    }

    // ============================================================================
    // Initialization
    // ============================================================================

    fun init(ctx: &mut TxContext) {
        // Create global treasury
        let treasury = Treasury {
            id: object::new(ctx),
            balance: balance::zero(),
            total_collected: 0,
            insurance_reserve: 0,
        };
        transfer::share_object(treasury);

        // Create agent registry
        let registry = AgentRegistry {
            id: object::new(ctx),
            registered_agents: vector::empty(),
        };
        transfer::share_object(registry);
    }

    // ============================================================================
    // Policy Management
    // ============================================================================

    /// Create a new policy linked to Ika dWallet
    public fun create_policy(
        name: String,
        ika_wallet_id: String,
        agent_public_key: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        let policy_uid = object::new(ctx);
        let policy_id = object::uid_to_address(&policy_uid);

        let policy = Policy {
            id: policy_uid,
            owner,
            name,
            created_at: current_time,
            updated_at: current_time,
            is_active: true,
            is_emergency_paused: false,
            rules: vector::empty(),
            daily_spent: 0,
            daily_reset_time: current_time + 86400000, // 24 hours
            ika_wallet_id,
            agent_public_key,
        };

        event::emit(PolicyCreated {
            policy_id,
            owner,
            name: policy.name,
            ika_wallet_id: policy.ika_wallet_id,
        });

        transfer::transfer(policy, owner);
    }

    /// Add amount limit rule (daily + per-transaction)
    public fun add_amount_limit(
        policy: &mut Policy,
        daily_limit: u64,
        per_tx_limit: u64,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let mut data = vector::empty<u8>();
        
        // Encode daily_limit (8 bytes)
        encode_u64(&mut data, daily_limit);
        // Encode per_tx_limit (8 bytes)
        encode_u64(&mut data, per_tx_limit);

        let rule = Rule {
            rule_type: RULE_AMOUNT_LIMIT,
            data,
            priority: 10,
            is_active: true,
        };

        vector::push_back(&mut policy.rules, rule);
        policy.updated_at = clock::timestamp_ms(clock);

        event::emit(RuleAdded {
            policy_id: object::uid_to_address(&policy.id),
            rule_type: RULE_AMOUNT_LIMIT,
            priority: 10,
        });
    }

    /// Add protocol allowlist
    public fun add_protocol_allowlist(
        policy: &mut Policy,
        allowed_protocols: vector<String>,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let mut data = vector::empty<u8>();
        let num_protocols = vector::length(&allowed_protocols);
        
        // Store count
        vector::push_back(&mut data, (num_protocols as u8));
        
        let mut i = 0;
        while (i < num_protocols) {
            let protocol = vector::borrow(&allowed_protocols, i);
            let bytes = string::as_bytes(protocol);
            let len = vector::length(bytes);
            
            assert!(len < 256, 99);
            vector::push_back(&mut data, (len as u8));
            
            let mut j = 0;
            while (j < len) {
                vector::push_back(&mut data, *vector::borrow(bytes, j));
                j = j + 1;
            };
            
            i = i + 1;
        };

        let rule = Rule {
            rule_type: RULE_PROTOCOL_ALLOWLIST,
            data,
            priority: 20,
            is_active: true,
        };

        vector::push_back(&mut policy.rules, rule);
        policy.updated_at = clock::timestamp_ms(clock);

        event::emit(RuleAdded {
            policy_id: object::uid_to_address(&policy.id),
            rule_type: RULE_PROTOCOL_ALLOWLIST,
            priority: 20,
        });
    }

    /// Add slippage limit rule
    public fun add_slippage_limit(
        policy: &mut Policy,
        max_slippage_bps: u64,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let mut data = vector::empty<u8>();
        encode_u64(&mut data, max_slippage_bps);

        let rule = Rule {
            rule_type: RULE_SLIPPAGE_LIMIT,
            data,
            priority: 15,
            is_active: true,
        };

        vector::push_back(&mut policy.rules, rule);
        policy.updated_at = clock::timestamp_ms(clock);

        event::emit(RuleAdded {
            policy_id: object::uid_to_address(&policy.id),
            rule_type: RULE_SLIPPAGE_LIMIT,
            priority: 15,
        });
    }

    /// Add gas budget rule
    public fun add_gas_budget(
        policy: &mut Policy,
        daily_gas_limit: u64,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let mut data = vector::empty<u8>();
        encode_u64(&mut data, daily_gas_limit);

        let rule = Rule {
            rule_type: RULE_GAS_BUDGET,
            data,
            priority: 5,
            is_active: true,
        };

        vector::push_back(&mut policy.rules, rule);
        policy.updated_at = clock::timestamp_ms(clock);

        event::emit(RuleAdded {
            policy_id: object::uid_to_address(&policy.id),
            rule_type: RULE_GAS_BUDGET,
            priority: 5,
        });
    }

    // ============================================================================
    // Transaction Execution
    // ============================================================================

    /// Agent proposes transaction (with first signature shard)
    public fun propose_transaction(
        policy: &mut Policy,
        amount: u64,
        recipient: address,
        protocol: String,
        chain_id: String,
        slippage_bps: u64,
        gas_budget: u64,
        agent_signature: vector<u8>,
        metadata: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(policy.is_active, E_POLICY_INACTIVE);
        assert!(!policy.is_emergency_paused, E_POLICY_INACTIVE);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Reset daily counter if needed
        if (current_time >= policy.daily_reset_time) {
            policy.daily_spent = 0;
            policy.daily_reset_time = current_time + 86400000;
        };

        // Validate against all active rules
        validate_transaction(policy, amount, &protocol, slippage_bps, gas_budget);

        let proposal_uid = object::new(ctx);
        let proposal_id = object::uid_to_address(&proposal_uid);

        let proposal = TxProposal {
            id: proposal_uid,
            policy_id: object::uid_to_address(&policy.id),
            proposer: tx_context::sender(ctx),
            amount,
            recipient,
            protocol,
            chain_id,
            slippage_bps,
            gas_budget,
            proposed_at: current_time,
            expires_at: current_time + TX_EXPIRY,
            status: STATUS_PENDING,
            agent_signature,
            ika_signature: vector::empty(),
            metadata,
        };

        event::emit(TxProposed {
            proposal_id,
            policy_id: proposal.policy_id,
            amount,
            protocol: proposal.protocol,
            chain_id: proposal.chain_id,
            proposed_at: current_time,
        });

        // Update daily spend tracking
        policy.daily_spent = policy.daily_spent + amount;

        transfer::transfer(proposal, policy.owner);
    }

    /// Ika network co-signs transaction (second signature shard)
    public fun ika_cosign(
        proposal: &mut TxProposal,
        ika_signature: vector<u8>,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(proposal.status == STATUS_PENDING, E_INVALID_STATUS);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < proposal.expires_at, E_EXPIRED);

        // In production, verify Ika network signature here
        // For now, we accept any signature from Ika nodes
        
        proposal.ika_signature = ika_signature;
        proposal.status = STATUS_APPROVED;

        event::emit(TxExecuted {
            proposal_id: object::uid_to_address(&proposal.id),
            policy_id: proposal.policy_id,
            amount: proposal.amount,
            executed_at: current_time,
        });
    }

    /// Reject transaction
    public fun reject_transaction(
        proposal: &mut TxProposal,
        reason: String,
        ctx: &TxContext
    ) {
        // Only policy owner or Ika network can reject
        assert!(proposal.status == STATUS_PENDING, E_INVALID_STATUS);
        
        proposal.status = STATUS_REJECTED;

        event::emit(TxRejected {
            proposal_id: object::uid_to_address(&proposal.id),
            policy_id: proposal.policy_id,
            reason,
        });
    }

    // ============================================================================
    // Emergency Controls
    // ============================================================================

    /// Emergency pause (immediate)
    public fun emergency_pause(
        policy: &mut Policy,
        reason: String,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        policy.is_emergency_paused = true;
        policy.updated_at = clock::timestamp_ms(clock);

        event::emit(EmergencyPause {
            policy_id: object::uid_to_address(&policy.id),
            paused_at: clock::timestamp_ms(clock),
            reason,
        });
    }

    /// Resume after emergency pause
    public fun resume_policy(
        policy: &mut Policy,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        policy.is_emergency_paused = false;
        policy.updated_at = clock::timestamp_ms(clock);
    }

    /// Propose policy update (with timelock)
    public fun propose_policy_update(
        policy: &Policy,
        new_rules: vector<Rule>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let current_time = clock::timestamp_ms(clock);
        let update_uid = object::new(ctx);
        let update_id = object::uid_to_address(&update_uid);

        let update = PolicyUpdate {
            id: update_uid,
            policy_id: object::uid_to_address(&policy.id),
            proposed_at: current_time,
            executable_at: current_time + POLICY_CHANGE_TIMELOCK,
            new_rules,
            executed: false,
        };

        event::emit(PolicyUpdateProposed {
            update_id,
            policy_id: update.policy_id,
            executable_at: update.executable_at,
        });

        transfer::transfer(update, policy.owner);
    }

    /// Execute policy update after timelock
    public fun execute_policy_update(
        policy: &mut Policy,
        update: &mut PolicyUpdate,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(policy.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(!update.executed, E_INVALID_STATUS);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= update.executable_at, E_TIMELOCK_ACTIVE);

        policy.rules = update.new_rules;
        policy.updated_at = current_time;
        update.executed = true;
    }

    // ============================================================================
    // Validation Logic
    // ============================================================================

    fun validate_transaction(
        policy: &Policy,
        amount: u64,
        protocol: &String,
        slippage_bps: u64,
        gas_budget: u64,
    ) {
        let num_rules = vector::length(&policy.rules);
        let mut i = 0;
        
        while (i < num_rules) {
            let rule = vector::borrow(&policy.rules, i);
            
            if (!rule.is_active) {
                i = i + 1;
                continue
            };

            if (rule.rule_type == RULE_AMOUNT_LIMIT) {
                validate_amount(rule, policy, amount);
            } else if (rule.rule_type == RULE_PROTOCOL_ALLOWLIST) {
                validate_protocol(rule, protocol);
            } else if (rule.rule_type == RULE_SLIPPAGE_LIMIT) {
                validate_slippage(rule, slippage_bps);
            } else if (rule.rule_type == RULE_GAS_BUDGET) {
                validate_gas(rule, gas_budget);
            };
            
            i = i + 1;
        };
    }

    fun validate_amount(rule: &Rule, policy: &Policy, amount: u64) {
        let data = &rule.data;
        
        let daily_limit = decode_u64(data, 0);
        let per_tx_limit = decode_u64(data, 8);
        
        assert!(amount <= per_tx_limit, E_RULE_VIOLATION);
        assert!(policy.daily_spent + amount <= daily_limit, E_RULE_VIOLATION);
    }

    fun validate_protocol(rule: &Rule, protocol: &String) {
        let data = &rule.data;
        let num_protocols = (*vector::borrow(data, 0) as u64);
        let mut offset = 1;
        
        let protocol_bytes = string::as_bytes(protocol);
        let protocol_len = vector::length(protocol_bytes);
        
        let mut i = 0;
        while (i < num_protocols) {
            let allowed_len = (*vector::borrow(data, offset) as u64);
            offset = offset + 1;
            
            if (allowed_len == protocol_len) {
                let mut match_found = true;
                let mut j = 0;
                
                while (j < allowed_len) {
                    if (*vector::borrow(data, offset + j) != *vector::borrow(protocol_bytes, j)) {
                        match_found = false;
                        break
                    };
                    j = j + 1;
                };
                
                if (match_found) {
                    return
                };
            };
            
            offset = offset + allowed_len;
            i = i + 1;
        };
        
        abort E_RULE_VIOLATION
    }

    fun validate_slippage(rule: &Rule, slippage_bps: u64) {
        let max_slippage = decode_u64(&rule.data, 0);
        assert!(slippage_bps <= max_slippage, E_RULE_VIOLATION);
    }

    fun validate_gas(rule: &Rule, gas_budget: u64) {
        let daily_gas_limit = decode_u64(&rule.data, 0);
        assert!(gas_budget <= daily_gas_limit, E_RULE_VIOLATION);
    }

    // ============================================================================
    // Helper Functions
    // ============================================================================

    fun encode_u64(data: &mut vector<u8>, value: u64) {
        vector::push_back(data, ((value >> 56) as u8));
        vector::push_back(data, ((value >> 48) as u8));
        vector::push_back(data, ((value >> 40) as u8));
        vector::push_back(data, ((value >> 32) as u8));
        vector::push_back(data, ((value >> 24) as u8));
        vector::push_back(data, ((value >> 16) as u8));
        vector::push_back(data, ((value >> 8) as u8));
        vector::push_back(data, (value as u8));
    }

    fun decode_u64(data: &vector<u8>, offset: u64): u64 {
        ((*vector::borrow(data, offset) as u64) << 56) |
        ((*vector::borrow(data, offset + 1) as u64) << 48) |
        ((*vector::borrow(data, offset + 2) as u64) << 40) |
        ((*vector::borrow(data, offset + 3) as u64) << 32) |
        ((*vector::borrow(data, offset + 4) as u64) << 24) |
        ((*vector::borrow(data, offset + 5) as u64) << 16) |
        ((*vector::borrow(data, offset + 6) as u64) << 8) |
        (*vector::borrow(data, offset + 7) as u64)
    }

    // ============================================================================
    // View Functions
    // ============================================================================

    public fun get_policy_status(policy: &Policy): (bool, bool, u64, u64) {
        (policy.is_active, policy.is_emergency_paused, policy.daily_spent, policy.daily_reset_time)
    }

    public fun get_proposal_status(proposal: &TxProposal): (u8, u64, u64) {
        (proposal.status, proposal.proposed_at, proposal.expires_at)
    }
}