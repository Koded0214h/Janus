from rest_framework import serializers
from agents.models import Agent, Intent, Transaction
from users.models import UserProfile

class DashboardStatsSerializer(serializers.Serializer):
    total_agents = serializers.IntegerField()
    active_agents = serializers.IntegerField()
    total_intents = serializers.IntegerField()
    active_intents = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()
    total_value_managed = serializers.DecimalField(max_digits=20, decimal_places=8)
    compliance_rate = serializers.FloatField()

class ActivityFeedSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    type = serializers.CharField()  # 'transaction', 'intent', 'agent'
    action = serializers.CharField()
    details = serializers.DictField()
    user_email = serializers.EmailField()

class PortfolioAllocationSerializer(serializers.Serializer):
    chain = serializers.CharField()
    token_symbol = serializers.CharField()
    amount = serializers.DecimalField(max_digits=30, decimal_places=18)
    value_usd = serializers.DecimalField(max_digits=20, decimal_places=2)
    percentage = serializers.FloatField()

class IntentExecutionSerializer(serializers.Serializer):
    intent_id = serializers.UUIDField()
    natural_language = serializers.CharField()
    parsed_parameters = serializers.DictField()
    expected_outcome = serializers.CharField()
    risk_level = serializers.CharField()