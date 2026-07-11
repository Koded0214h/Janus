from rest_framework import serializers
from .models import Agent, Intent, Transaction, PolicyCheck
from users.serializers import UserSerializer

class AgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    performance_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Agent
        fields = '__all__'
        read_only_fields = ('id', 'user', 'total_executions', 'successful_executions',
                          'failed_executions', 'total_value_managed', 'created_at',
                          'last_active', 'deactivated_at')
    
    def get_performance_rate(self, obj):
        if obj.total_executions > 0:
            return (obj.successful_executions / obj.total_executions) * 100
        return 0

class IntentSerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Intent
        fields = '__all__'
        read_only_fields = ('id', 'agent', 'user', 'parsed_parameters', 'policy_id',
                          'created_at', 'updated_at', 'last_executed')
    
    def validate_natural_language(self, value):
        # Basic validation for intent description
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Intent description must be at least 10 characters long.")
        return value

class TransactionSerializer(serializers.ModelSerializer):
    intent = IntentSerializer(read_only=True)
    agent = AgentSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('id', 'intent', 'agent', 'user', 'tx_hash', 'status',
                          'mpc_session_id', 'iaka_signature', 'gas_used', 'gas_price',
                          'error_message', 'created_at', 'executed_at', 'confirmed_at')

class PolicyCheckSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    
    class Meta:
        model = PolicyCheck
        fields = '__all__'
        read_only_fields = ('id', 'transaction', 'checked_at')

class IntentCreateSerializer(serializers.ModelSerializer):
    agent_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Intent
        fields = ('agent_id', 'intent_type', 'natural_language', 'execution_frequency')
    
    def create(self, validated_data):
        user = self.context['request'].user
        agent_id = validated_data.pop('agent_id')
        
        try:
            agent = Agent.objects.get(id=agent_id, user=user)
        except Agent.DoesNotExist:
            raise serializers.ValidationError({"agent_id": "Agent not found or doesn't belong to user."})
        
        # This is where LLM parsing would happen
        # For now, we'll create a simple parsed_parameters structure
        validated_data['parsed_parameters'] = {
            'natural_language': validated_data['natural_language'],
            'intent_type': validated_data['intent_type']
        }
        
        intent = Intent.objects.create(
            agent=agent,
            user=user,
            **validated_data
        )
        
        return intent

class TransactionProposalSerializer(serializers.Serializer):
    intent_id = serializers.UUIDField()
    chain = serializers.CharField(max_length=50)
    from_address = serializers.CharField(max_length=255)
    to_address = serializers.CharField(max_length=255)
    amount = serializers.DecimalField(max_digits=30, decimal_places=18)
    token_symbol = serializers.CharField(max_length=20)
    protocol = serializers.CharField(max_length=100, required=False, allow_blank=True)
    function_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate(self, data):
        # Add validation logic here
        # Check if intent belongs to user, etc.
        return data