from django.contrib import admin
from .models import Agent, Intent, Transaction, PolicyCheck

class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    fields = ('tx_hash', 'chain', 'amount', 'token_symbol', 'status', 'created_at')
    readonly_fields = ('created_at',)

class IntentInline(admin.TabularInline):
    model = Intent
    extra = 0
    fields = ('intent_type', 'natural_language', 'status', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'agent_type', 'is_active', 'total_executions', 'created_at')
    list_filter = ('agent_type', 'is_active', 'created_at')
    search_fields = ('name', 'user__email', 'description')
    inlines = [IntentInline]
    readonly_fields = ('total_executions', 'successful_executions', 'failed_executions',
                      'total_value_managed', 'created_at', 'last_active', 'deactivated_at')

@admin.register(Intent)
class IntentAdmin(admin.ModelAdmin):
    list_display = ('intent_type', 'agent', 'user', 'status', 'is_active', 'created_at')
    list_filter = ('intent_type', 'status', 'is_active', 'created_at')
    search_fields = ('natural_language', 'agent__name', 'user__email')
    inlines = [TransactionInline]
    readonly_fields = ('parsed_parameters', 'created_at', 'updated_at', 'last_executed')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('tx_hash', 'intent', 'chain', 'amount', 'token_symbol', 'status', 'created_at')
    list_filter = ('status', 'chain', 'created_at')
    search_fields = ('tx_hash', 'from_address', 'to_address', 'intent__natural_language')
    readonly_fields = ('created_at', 'executed_at', 'confirmed_at', 'mpc_session_id')

@admin.register(PolicyCheck)
class PolicyCheckAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'is_compliant', 'checked_at')
    list_filter = ('is_compliant', 'checked_at')
    readonly_fields = ('checked_at',)