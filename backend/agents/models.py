from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Agent(models.Model):
    AGENT_TYPE_CHOICES = [
        ('YIELD_FARMER', 'Yield Farmer'),
        ('REBALANCER', 'Portfolio Rebalancer'),
        ('SENTRY', 'Security Sentry'),
        ('COMPLIANCE', 'Compliance Checker'),
        ('CUSTOM', 'Custom Agent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agents')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    agent_type = models.CharField(max_length=50, choices=AGENT_TYPE_CHOICES)
    
    # Configuration
    config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    
    # Performance metrics
    total_executions = models.IntegerField(default=0)
    successful_executions = models.IntegerField(default=0)
    failed_executions = models.IntegerField(default=0)
    total_value_managed = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_agent_type_display()}) - {self.user.email}"
    
    class Meta:
        ordering = ['-created_at']

class Intent(models.Model):
    INTENT_TYPE_CHOICES = [
        ('PORTFOLIO_REBALANCE', 'Portfolio Rebalance'),
        ('YIELD_FARMING', 'Yield Farming'),
        ('RISK_MANAGEMENT', 'Risk Management'),
        ('LIQUIDITY_PROVISION', 'Liquidity Provision'),
        ('EMERGENCY_WITHDRAWAL', 'Emergency Withdrawal'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='intents')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='intents')
    
    # Intent details
    intent_type = models.CharField(max_length=50, choices=INTENT_TYPE_CHOICES)
    natural_language = models.TextField()  # User's natural language description
    parsed_parameters = models.JSONField()  # Parsed parameters from LLM
    policy_id = models.CharField(max_length=255, blank=True)  # Reference to Sui policy contract
    
    # Execution parameters
    execution_frequency = models.CharField(max_length=50, default='ON_DEMAND')  # DAILY, WEEKLY, ON_DEMAND
    next_execution = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', 'Draft'),
            ('ACTIVE', 'Active'),
            ('PAUSED', 'Paused'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
        ],
        default='DRAFT'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_executed = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_intent_type_display()} - {self.agent.name}"
    
    class Meta:
        ordering = ['-created_at']

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('EXECUTED', 'Executed'),
        ('FAILED', 'Failed'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    intent = models.ForeignKey(Intent, on_delete=models.CASCADE, related_name='transactions')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    
    # Transaction details
    chain = models.CharField(max_length=50)  # SUI, ETH, BTC, etc.
    from_address = models.CharField(max_length=255)
    to_address = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=30, decimal_places=18)
    token_symbol = models.CharField(max_length=20)
    token_address = models.CharField(max_length=255, blank=True)
    
    # Protocol information
    protocol = models.CharField(max_length=100, blank=True)
    function_name = models.CharField(max_length=100, blank=True)
    
    # Execution data
    tx_hash = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # MPC signing details
    mpc_session_id = models.CharField(max_length=255, blank=True)
    iaka_signature = models.TextField(blank=True)
    
    # Metadata
    gas_used = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    gas_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.tx_hash or 'Pending'} - {self.amount} {self.token_symbol}"
    
    class Meta:
        ordering = ['-created_at']

class PolicyCheck(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='policy_check')
    
    # Policy validation results
    is_amount_within_limit = models.BooleanField(default=False)
    is_protocol_allowed = models.BooleanField(default=False)
    is_destination_allowed = models.BooleanField(default=False)
    is_gas_within_limit = models.BooleanField(default=False)
    is_time_window_valid = models.BooleanField(default=False)
    
    # Compliance checks
    is_kyc_verified = models.BooleanField(default=False)
    is_sanctions_compliant = models.BooleanField(default=False)
    
    # Overall result
    is_compliant = models.BooleanField(default=False)
    violation_reasons = models.JSONField(default=list)
    
    # Timestamps
    checked_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Policy Check for {self.transaction}"