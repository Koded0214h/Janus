#!/bin/bash
# test_drift_trade.sh — Simulates a Drift Basis Trade flow

echo "=== Janus Protocol: Drift Trading Verification ==="

# 1. Create a Drift Vault Manager Agent
echo "Step 1: Creating Drift Vault Manager Agent..."
source .venv/bin/activate
python3 manage.py shell <<EOF
from django.contrib.auth import get_user_model
from agents.models import Agent
User = get_user_model()
user = User.objects.first()
agent, created = Agent.objects.get_or_create(
    user=user,
    name="Drift Alpha Bot",
    agent_type="DRIFT_VAULT_MANAGER",
    defaults={
        "config": {"ai_model": "gemini-2.5-flash", "solana_address": "vAuLt...mock"},
        "is_active": True
    }
)
print(f"Agent ID: {agent.id}")
EOF

# 2. Create a Basis Trade Intent
echo "Step 2: Creating Basis Trade Intent..."
python3 manage.py shell <<EOF
from agents.models import Agent, Intent
agent = Agent.objects.filter(agent_type="DRIFT_VAULT_MANAGER").first()
intent, created = Intent.objects.get_or_create(
    agent=agent,
    user=agent.user,
    intent_type="BASIS_TRADE",
    defaults={
        "natural_language": "Keep my ETH portfolio delta-neutral on Drift. Short ETH-PERP when buying spot.",
        "parsed_parameters": {
            "strategy_parameters": {
                "leverage": 1.0,
                "spot_asset": "ETH",
                "perp_asset": "ETH-PERP"
            }
        },
        "status": "ACTIVE",
        "is_active": True
    }
)
print(f"Intent ID: {intent.id}")
EOF

# 3. Simulate Execution (Calls execute endpoint logic)
echo "Step 3: Triggering Intent Execution..."
export DRIFT_BRIDGE_URL="http://localhost:3002"
python3 manage.py shell <<EOF
from agents.models import Intent
from django.test import RequestFactory
from agents.views import IntentViewSet
import json
import os

intent = Intent.objects.filter(intent_type="BASIS_TRADE").first()
factory = RequestFactory()
request = factory.post(f'/api/intents/{intent.id}/execute/')
request.user = intent.user

# Ensure environment variables are passed to the view if needed
# (Django views usually read from os.environ or settings)

from rest_framework_simplejwt.tokens import AccessToken
token = AccessToken.for_user(intent.user)
request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'

view = IntentViewSet.as_view({'post': 'execute'})
response = view(request, pk=str(intent.id))

print(f"Response Status: {response.status_code}")
print(f"Response Data: {json.dumps(response.data, indent=2)}")
EOF

echo "=== Verification Complete ==="
