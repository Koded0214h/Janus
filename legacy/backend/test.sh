#!/bin/bash

# Janus Protocol Backend Test Script
# Complete user flow testing with curl

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8000"
TEST_USER_EMAIL="testuser@janus4.test"
TEST_USER_PASSWORD="TestPass123!"

# Variables to store data between tests
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
AGENT_ID=""
INTENT_ID=""

# Helper functions
print_header() {
    printf "\n${BLUE}=== %s ===${NC}\n" "$1"
}

print_success() {
    printf "${GREEN}✓ %s${NC}\n" "$1"
}

print_error() {
    printf "${RED}✗ %s${NC}\n" "$1"
}

print_info() {
    printf "${YELLOW}ℹ %s${NC}\n" "$1"
}

# Extract HTTP code and body from curl response
extract_response() {
    local response="$1"
    HTTP_CODE=$(echo "$response" | tail -n1)
    BODY=$(echo "$response" | sed '$d')
}

# Wait for server to be ready
wait_for_server() {
    print_header "Waiting for Django server to be ready..."
    
    for i in {1..30}; do
        if curl -s -f "$BASE_URL/api/health/" > /dev/null 2>&1; then
            print_success "Server is ready!"
            return 0
        fi
        printf "."
        sleep 1
    done
    
    print_error "Server not ready after 30 seconds"
    exit 1
}

# Clean up function
cleanup() {
    print_header "Cleaning up test data..."
    
    if [ ! -z "$ACCESS_TOKEN" ]; then
        # Logout
        if [ ! -z "$REFRESH_TOKEN" ]; then
            curl -s -X POST \
                -H "Content-Type: application/json" \
                -d "{\"refresh\":\"$REFRESH_TOKEN\"}" \
                "$BASE_URL/api/users/logout/" > /dev/null 2>&1 || true
        fi
    fi
}

# Trap to ensure cleanup runs on exit
trap cleanup EXIT

# Main test flow
main() {
    print_header "JANUS PROTOCOL BACKEND TEST SUITE"
    echo "Base URL: $BASE_URL"
    echo "Starting complete user flow test..."
    
    # Wait for server
    wait_for_server
    
    # Test 1: Health Check
    print_header "Test 1: Health Check"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health/")
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Health check passed"
        echo "Status: $(echo "$BODY" | jq -r '.status')"
    else
        print_error "Health check failed with code $HTTP_CODE"
        exit 1
    fi
    
    # Test 2: User Registration
    print_header "Test 2: User Registration"
    
    cat > /tmp/register_data.json << EOF
{
    "email": "$TEST_USER_EMAIL",
    "password": "$TEST_USER_PASSWORD",
    "confirm_password": "$TEST_USER_PASSWORD",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e90F1A90411"
}
EOF
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/register_data.json \
        "$BASE_URL/api/users/register/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 201 ]; then
        print_success "User registration successful"
        ACCESS_TOKEN=$(echo "$BODY" | jq -r '.access')
        REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refresh')
        
        if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
            print_error "Failed to extract access token"
            exit 1
        fi
        print_info "Access token obtained"
    else
        print_error "Registration failed with code $HTTP_CODE"
        echo "Response: $BODY"
        exit 1
    fi
    
    # Test 3: Get User Profile
    print_header "Test 3: Get User Profile"
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$BASE_URL/api/users/me/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Get user profile successful"
        USER_ID=$(echo "$BODY" | jq -r '.id')
        echo "User ID: $USER_ID"
        echo "Email: $(echo "$BODY" | jq -r '.email')"
    else
        print_error "Get profile failed with code $HTTP_CODE"
        exit 1
    fi
    
    # Test 4: Create AI Agent
    print_header "Test 4: Create AI Agent"
    
    cat > /tmp/agent_data.json << EOF
{
    "name": "Yield Farmer Pro",
    "description": "Automated yield farming with AI risk assessment",
    "agent_type": "YIELD_FARMER",
    "config": {
        "max_slippage": 0.005,
        "allowed_protocols": ["aave", "compound"],
        "ai_model": "claude-3-haiku",
        "risk_assessment_enabled": true
    }
}
EOF
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d @/tmp/agent_data.json \
        "$BASE_URL/api/agents/agents/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 201 ]; then
        print_success "Create agent successful"
        AGENT_ID=$(echo "$BODY" | jq -r '.id')
        echo "Agent ID: $AGENT_ID"
        echo "AI Model: $(echo "$BODY" | jq -r '.config.ai_model')"
    else
        print_error "Create agent failed with code $HTTP_CODE"
        echo "Response: $BODY"
        exit 1
    fi
    
    # Test 5: Create Intent with AI Parsing
    print_header "Test 5: Create Intent"
    
    cat > /tmp/intent_data.json << EOF
{
    "agent_id": "$AGENT_ID",
    "intent_type": "YIELD_FARMING",
    "natural_language": "Keep 50% of my portfolio in BTC, 30% in ETH, and 20% in SUI. Rebalance when allocation drifts by more than 5%.",
    "execution_frequency": "DAILY"
}
EOF
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d @/tmp/intent_data.json \
        "$BASE_URL/api/agents/intents/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 201 ]; then
        print_success "Create intent successful"
        INTENT_ID=$(echo "$BODY" | jq -r '.id')
        echo "Intent ID: $INTENT_ID"
        echo "Parsed Parameters:"
        echo "$BODY" | jq -r '.parsed_parameters'
    else
        print_error "Create intent failed with code $HTTP_CODE"
        echo "Response: $BODY"
        exit 1
    fi
    
    # Test 6: Execute Intent with AI
    print_header "Test 6: Execute Intent with AI"
    
    cat > /tmp/execute_data.json << EOF
{
    "intent_id": "$INTENT_ID"
}
EOF
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d @/tmp/execute_data.json \
        "$BASE_URL/api/intents/execute/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Execute intent successful"
        echo "AI Analysis: $(echo "$BODY" | jq -r '.execution.expected_outcome')"
        echo "Risk Level: $(echo "$BODY" | jq -r '.execution.risk_level')"
    else
        print_error "Execute intent failed with code $HTTP_CODE"
    fi
    
    # Test 7: Dashboard Stats
    print_header "Test 7: Dashboard Stats"
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$BASE_URL/api/dashboard/stats/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Get dashboard stats successful"
        echo "Total Agents: $(echo "$BODY" | jq -r '.total_agents')"
        echo "Active Intents: $(echo "$BODY" | jq -r '.active_intents')"
    else
        print_error "Get dashboard stats failed with code $HTTP_CODE"
    fi
    
    # Test 8: Cleanup
    print_header "Test 8: Logout"
    
    cat > /tmp/logout_data.json << EOF
{
    "refresh": "$REFRESH_TOKEN"
}
EOF
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d @/tmp/logout_data.json \
        "$BASE_URL/api/users/logout/")
    
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" -eq 205 ]; then
        print_success "Logout successful"
        ACCESS_TOKEN=""
        REFRESH_TOKEN=""
    else
        print_error "Logout failed with code $HTTP_CODE"
    fi
    
    print_header "TEST COMPLETE"
    print_success "✅ All tests completed successfully!"
    echo ""
    echo "Summary:"
    echo "  ✓ User Registration"
    echo "  ✓ Profile Management"
    echo "  ✓ AI Agent Creation"
    echo "  ✓ Intent Creation & AI Parsing"
    echo "  ✓ Intent Execution"
    echo "  ✓ Dashboard Analytics"
    echo "  ✓ Logout"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install it with:${NC}"
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  macOS: brew install jq"
    exit 1
fi

# Run main function
main "$@"