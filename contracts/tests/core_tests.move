#[test_only]
module janus::core_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use std::string;
    use std::vector;
    use janus::core::{Self, Policy, TxProposal, PolicyUpdate};

    // Test addresses
    const ADMIN: address = @0xAA;
    const AGENT: address = @0xAB;
    const USER: address = @0xAC;

    // ============================================================================
    // Helper Functions
    // ============================================================================

    fun create_test_policy(scenario: &mut Scenario): address {
        test_scenario::next_tx(scenario, ADMIN);
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            core::create_policy(
                string::utf8(b"Test Portfolio Policy"),
                string::utf8(b"ika_wallet_xyz123"),
                vector::singleton(0x01),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
        };

        test_scenario::next_tx(scenario, ADMIN);
        let policy = test_scenario::take_from_sender<Policy>(scenario);
        let policy_id = object::id_to_address(&object::id(&policy));
        test_scenario::return_to_sender(scenario, policy);
        
        policy_id
    }

    // ============================================================================
    // Policy Creation Tests
    // ============================================================================

    #[test]
    fun test_create_policy() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        let policy_id = create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let policy = test_scenario::take_from_address<Policy>(scenario, ADMIN);
            
            let (is_active, is_paused, daily_spent, _) = core::get_policy_status(&policy);
            
            assert!(is_active == true, 0);
            assert!(is_paused == false, 1);
            assert!(daily_spent == 0, 2);
            
            test_scenario::return_to_address(ADMIN, policy);
        };

        test_scenario::end(scenario_val);
    }

    // ============================================================================
    // Rule Addition Tests
    // ============================================================================

    #[test]
    fun test_add_amount_limit() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            // Add daily limit: $10,000, per-tx limit: $1,000
            core::add_amount_limit(
                &mut policy,
                10000 * 1000000, // $10k in USDC (6 decimals)
                1000 * 1000000,  // $1k in USDC
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_add_protocol_allowlist() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let mut protocols = vector::empty<string::String>();
            vector::push_back(&mut protocols, string::utf8(b"Uniswap"));
            vector::push_back(&mut protocols, string::utf8(b"Aave"));
            vector::push_back(&mut protocols, string::utf8(b"Compound"));
            
            core::add_protocol_allowlist(
                &mut policy,
                protocols,
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_add_slippage_limit() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            // 0.5% max slippage (50 basis points)
            core::add_slippage_limit(
                &mut policy,
                50,
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_add_gas_budget() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            // $20 daily gas budget
            core::add_gas_budget(
                &mut policy,
                20 * 1000000,
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::end(scenario_val);
    }

    // ============================================================================
    // Transaction Proposal Tests
    // ============================================================================

    #[test]
    fun test_valid_transaction_proposal() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        // Setup policy with rules
        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            core::add_amount_limit(&mut policy, 10000000000, 1000000000, &clock, test_scenario::ctx(scenario));
            
            let mut protocols = vector::empty<string::String>();
            vector::push_back(&mut protocols, string::utf8(b"Uniswap"));
            core::add_protocol_allowlist(&mut policy, protocols, &clock, test_scenario::ctx(scenario));
            
            core::add_slippage_limit(&mut policy, 50, &clock, test_scenario::ctx(scenario));
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        // Agent proposes valid transaction
        test_scenario::next_tx(scenario, AGENT);
        {
            let mut policy = test_scenario::take_from_address<Policy>(scenario, ADMIN);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let signature = vector::empty<u8>();
            vector::push_back(&mut signature, 0x01);
            
            core::propose_transaction(
                &mut policy,
                500000000, // $500
                USER,
                string::utf8(b"Uniswap"),
                string::utf8(b"ethereum"),
                30, // 0.3% slippage
                100000,
                signature,
                string::utf8(b"{}"),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_address(ADMIN, policy);
        };

        // Verify proposal created
        test_scenario::next_tx(scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_for_sender<TxProposal>(scenario), 3);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = janus::core::E_RULE_VIOLATION)]
    fun test_transaction_exceeds_limit() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            // Set limit: $1000 per tx
            core::add_amount_limit(&mut policy, 10000000000, 1000000000, &clock, test_scenario::ctx(scenario));
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        // Try to propose $2000 transaction (should fail)
        test_scenario::next_tx(scenario, AGENT);
        {
            let mut policy = test_scenario::take_from_address<Policy>(scenario, ADMIN);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let signature = vector::empty<u8>();
            
            core::propose_transaction(
                &mut policy,
                2000000000, // $2000 - exceeds limit!
                USER,
                string::utf8(b"Uniswap"),
                string::utf8(b"ethereum"),
                30,
                100000,
                signature,
                string::utf8(b"{}"),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_address(ADMIN, policy);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = janus::core::E_RULE_VIOLATION)]
    fun test_transaction_disallowed_protocol() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            // Only allow Uniswap
            let mut protocols = vector::empty<string::String>();
            vector::push_back(&mut protocols, string::utf8(b"Uniswap"));
            core::add_protocol_allowlist(&mut policy, protocols, &clock, test_scenario::ctx(scenario));
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        // Try to use Sushiswap (should fail)
        test_scenario::next_tx(scenario, AGENT);
        {
            let mut policy = test_scenario::take_from_address<Policy>(scenario, ADMIN);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let signature = vector::empty<u8>();
            
            core::propose_transaction(
                &mut policy,
                500000000,
                USER,
                string::utf8(b"Sushiswap"), // Not allowed!
                string::utf8(b"ethereum"),
                30,
                100000,
                signature,
                string::utf8(b"{}"),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_address(ADMIN, policy);
        };

        test_scenario::end(scenario_val);
    }

    // ============================================================================
    // Co-signing Tests
    // ============================================================================

    #[test]
    fun test_ika_cosign() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        // Create proposal
        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            core::add_amount_limit(&mut policy, 10000000000, 1000000000, &clock, test_scenario::ctx(scenario));
            
            let signature = vector::empty<u8>();
            
            core::propose_transaction(
                &mut policy,
                500000000,
                USER,
                string::utf8(b"Uniswap"),
                string::utf8(b"ethereum"),
                30,
                100000,
                signature,
                string::utf8(b"{}"),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        // Ika network co-signs
        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut proposal = test_scenario::take_from_sender<TxProposal>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let mut ika_sig = vector::empty<u8>();
            vector::push_back(&mut ika_sig, 0xAA);
            vector::push_back(&mut ika_sig, 0xBB);
            
            core::ika_cosign(&mut proposal, ika_sig, &clock, test_scenario::ctx(scenario));
            
            let (status, _, _) = core::get_proposal_status(&proposal);
            assert!(status == 1, 4); // STATUS_APPROVED
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, proposal);
        };

        test_scenario::end(scenario_val);
    }

    // ============================================================================
    // Emergency Control Tests
    // ============================================================================

    #[test]
    fun test_emergency_pause() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            core::emergency_pause(
                &mut policy,
                string::utf8(b"Protocol hack detected"),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            let (_, is_paused, _, _) = core::get_policy_status(&policy);
            assert!(is_paused == true, 5);
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = janus::core::E_POLICY_INACTIVE)]
    fun test_cannot_transact_when_paused() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        // Pause policy
        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            core::emergency_pause(&mut policy, string::utf8(b"Test"), &clock, test_scenario::ctx(scenario));
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        // Try to transact (should fail)
        test_scenario::next_tx(scenario, AGENT);
        {
            let mut policy = test_scenario::take_from_address<Policy>(scenario, ADMIN);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let signature = vector::empty<u8>();
            
            core::propose_transaction(
                &mut policy,
                500000000,
                USER,
                string::utf8(b"Uniswap"),
                string::utf8(b"ethereum"),
                30,
                100000,
                signature,
                string::utf8(b"{}"),
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_address(ADMIN, policy);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_resume_after_pause() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let mut policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            // Pause
            core::emergency_pause(&mut policy, string::utf8(b"Test"), &clock, test_scenario::ctx(scenario));
            
            let (_, is_paused, _, _) = core::get_policy_status(&policy);
            assert!(is_paused == true, 6);
            
            // Resume
            core::resume_policy(&mut policy, &clock, test_scenario::ctx(scenario));
            
            let (_, is_paused_after, _, _) = core::get_policy_status(&policy);
            assert!(is_paused_after == false, 7);
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::end(scenario_val);
    }

    // ============================================================================
    // Policy Update Tests
    // ============================================================================

    #[test]
    fun test_propose_policy_update() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        create_test_policy(scenario);

        test_scenario::next_tx(scenario, ADMIN);
        {
            let policy = test_scenario::take_from_sender<Policy>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            let new_rules = vector::empty();
            
            core::propose_policy_update(
                &policy,
                new_rules,
                &clock,
                test_scenario::ctx(scenario)
            );
            
            clock::destroy_for_testing(clock);
            test_scenario::return_to_sender(scenario, policy);
        };

        test_scenario::next_tx(scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_for_sender<PolicyUpdate>(scenario), 8);
        };

        test_scenario::end(scenario_val);
    }
}