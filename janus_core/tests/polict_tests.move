#[test_only]
module janus_core::policy_tests {
    use sui::test_scenario;
    use janus_core::policy::{Self, TreasuryPolicy};

    #[test]
    fun test_valid_transaction() {
        let admin = @0xAD;
        let protocol = @0x123;
        let mut scenario = test_scenario::begin(admin);
        
        policy::create_policy(100, scenario.ctx());
        
        scenario.next_tx(admin);
        let mut policy = scenario.take_shared<TreasuryPolicy>();
        
        policy.add_protocol(protocol, scenario.ctx());
        policy.check_compliance(50, protocol);
        
        test_scenario::return_shared(policy);
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = janus_core::policy::EOverSpendLimit)]
    fun test_invalid_spend_limit() {
        let admin = @0xAD;
        let mut scenario = test_scenario::begin(admin);
        
        policy::create_policy(100, scenario.ctx());
        
        scenario.next_tx(admin);
        let policy = scenario.take_shared<TreasuryPolicy>();
        
        // This should trigger the error
        policy.check_compliance(150, @0x123);
        
        test_scenario::return_shared(policy);
        scenario.end();
    }
}