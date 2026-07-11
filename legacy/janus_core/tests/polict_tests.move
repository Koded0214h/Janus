#[test_only]
module janus_core::policy_tests {
    use sui::test_scenario;
    use janus_core::policy::{Self, TreasuryPolicy};

    // Test Addresses (Must be valid Hex A-F, 0-9)
    const OWNER: address = @0xAD;
    const AGENT: address = @0xAB; // Changed from AG to AB
    const PROTOCOL: address = @0x123;
    const STRANGER: address = @0xDE;

    #[test]
    fun test_full_successful_flow() {
        let mut scenario = test_scenario::begin(OWNER);
        
        policy::create_policy(AGENT, 1000, scenario.ctx());
        
        scenario.next_tx(OWNER);
        let mut policy = scenario.take_shared<TreasuryPolicy>();
        policy::add_protocol(&mut policy, PROTOCOL, scenario.ctx());
        
        scenario.next_tx(AGENT);
        policy::check_compliance(&policy, 500, PROTOCOL, scenario.ctx());
        
        test_scenario::return_shared(policy);
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = janus_core::policy::EOverSpendLimit)]
    fun test_fail_over_spend_limit() {
        let mut scenario = test_scenario::begin(OWNER);
        policy::create_policy(AGENT, 100, scenario.ctx());
        
        scenario.next_tx(AGENT);
        let policy = scenario.take_shared<TreasuryPolicy>();
        policy::check_compliance(&policy, 150, PROTOCOL, scenario.ctx());
        
        test_scenario::return_shared(policy);
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = janus_core::policy::ENotAuthorized)]
    fun test_fail_unauthorized_agent() {
        let mut scenario = test_scenario::begin(OWNER);
        policy::create_policy(AGENT, 1000, scenario.ctx());
        
        scenario.next_tx(STRANGER);
        let policy = scenario.take_shared<TreasuryPolicy>();
        policy::check_compliance(&policy, 100, PROTOCOL, scenario.ctx());
        
        test_scenario::return_shared(policy);
        scenario.end();
    }
}