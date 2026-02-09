from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Sum
from django.conf import settings
import uuid
import json
import logging

from .models import Agent, Intent, Transaction, PolicyCheck
from .serializers import (
    AgentSerializer,
    IntentSerializer,
    TransactionSerializer,
    PolicyCheckSerializer,
    IntentCreateSerializer,
    TransactionProposalSerializer
)
from users.models import UserProfile
from .ai_service import ai_service  # We'll create this with Gemini+Anthropic

logger = logging.getLogger(__name__)


class AgentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AI Agents.
    Supports creation, activation, deactivation, and intent management.
    """
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only agents belonging to the current user."""
        return Agent.objects.filter(user=self.request.user).select_related('user')
    
    def perform_create(self, serializer):
        """Create agent for the current user with AI model configuration."""
        user = self.request.user
        
        # Set default AI model if not specified
        data = serializer.validated_data.copy()
        if 'ai_model' not in data.get('config', {}):
            data.setdefault('config', {})['ai_model'] = 'gemini-pro'
        
        # Create agent
        agent = serializer.save(user=user)
        
        # Update agent stats
        agent.last_active = timezone.now()
        agent.save()
        
        logger.info(f"Created agent {agent.id} for user {user.email}")
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an agent."""
        agent = self.get_object()
        
        if agent.is_active:
            return Response(
                {'detail': 'Agent is already active.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent.is_active = True
        agent.deactivated_at = None
        agent.last_active = timezone.now()
        agent.save()
        
        logger.info(f"Activated agent {agent.id} for user {request.user.email}")
        
        return Response({
            'status': 'Agent activated',
            'agent': AgentSerializer(agent).data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an agent."""
        agent = self.get_object()
        
        if not agent.is_active:
            return Response(
                {'detail': 'Agent is already inactive.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent.is_active = False
        agent.deactivated_at = timezone.now()
        agent.save()
        
        # Deactivate all associated intents
        agent.intents.filter(is_active=True).update(is_active=False, status='PAUSED')
        
        logger.info(f"Deactivated agent {agent.id} for user {request.user.email}")
        
        return Response({
            'status': 'Agent deactivated',
            'agent': AgentSerializer(agent).data
        })
    
    @action(detail=True, methods=['get'])
    def intents(self, request, pk=None):
        """Get all intents for an agent."""
        agent = self.get_object()
        intents = agent.intents.all().order_by('-created_at')
        
        page = self.paginate_queryset(intents)
        if page is not None:
            serializer = IntentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = IntentSerializer(intents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for an agent."""
        agent = self.get_object()
        transactions = agent.transactions.all().order_by('-created_at')
        
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def analyze_market(self, request, pk=None):
        """
        Analyze current market conditions using AI.
        """
        agent = self.get_object()
        
        # Get portfolio data from user profile
        try:
            profile = request.user.profile
            portfolio_data = {
                'risk_tolerance': profile.risk_tolerance,
                'preferred_chains': profile.preferred_chains,
                'excluded_protocols': profile.excluded_protocols,
                'max_gas_per_tx': float(profile.max_gas_per_tx)
            }
        except UserProfile.DoesNotExist:
            portfolio_data = {}
        
        # Add agent-specific data
        portfolio_data.update({
            'agent_type': agent.agent_type,
            'agent_config': agent.config,
            'total_executions': agent.total_executions,
            'success_rate': agent.successful_executions / max(agent.total_executions, 1)
        })
        
        # Use AI service to analyze market
        try:
            analysis = ai_service.analyze_market_conditions(portfolio_data)
            
            # Log the analysis
            logger.info(f"Market analysis for agent {agent.id}: {analysis.get('risk_assessment', 'unknown')}")
            
            return Response({
                'agent_id': str(agent.id),
                'agent_name': agent.name,
                'analysis': analysis,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Market analysis failed for agent {agent.id}: {str(e)}")
            return Response({
                'error': 'Market analysis failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def test_ai(self, request, pk=None):
        """
        Test AI capabilities of the agent.
        """
        agent = self.get_object()
        prompt = request.data.get('prompt', 'Hello, who are you?')
        
        try:
            # Test AI response
            response = ai_service.test_ai_capabilities(
                prompt=prompt,
                agent_type=agent.agent_type,
                agent_config=agent.config
            )
            
            return Response({
                'agent_id': str(agent.id),
                'agent_name': agent.name,
                'prompt': prompt,
                'response': response,
                'ai_model': agent.config.get('ai_model', 'gemini-pro')
            })
            
        except Exception as e:
            logger.error(f"AI test failed for agent {agent.id}: {str(e)}")
            return Response({
                'error': 'AI test failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IntentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Intents.
    Supports creation, activation, pausing, and transaction viewing.
    """
    serializer_class = IntentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only intents belonging to the current user."""
        return Intent.objects.filter(user=self.request.user).select_related('agent', 'user')
    
    def get_serializer_class(self):
        """Use different serializer for creation."""
        if self.action == 'create':
            return IntentCreateSerializer
        return IntentSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new intent with AI parsing.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the agent
        agent_id = serializer.validated_data.get('agent_id')
        try:
            agent = Agent.objects.get(id=agent_id, user=request.user)
        except Agent.DoesNotExist:
            return Response(
                {'detail': 'Agent not found or access denied.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create intent instance
        intent = Intent(
            agent=agent,
            user=request.user,
            intent_type=serializer.validated_data.get('intent_type'),
            natural_language=serializer.validated_data.get('natural_language'),
            execution_frequency=serializer.validated_data.get('execution_frequency', 'ON_DEMAND'),
            status='DRAFT'
        )
        
        # Parse with AI
        try:
            parsed_params = ai_service.parse_natural_language_intent(
                intent.natural_language,
                intent.intent_type,
                agent.config.get('ai_model', 'gemini-pro')
            )
            
            intent.parsed_parameters = parsed_params
            intent.ai_parsed = True
            intent.ai_confidence = parsed_params.get('confidence_score', 0.7)
            
            # Extract target allocations for portfolio reference
            if 'target_allocations' in parsed_params:
                intent.parsed_parameters['extracted_allocation'] = parsed_params['target_allocations']
            
            logger.info(f"AI parsed intent for agent {agent.id} with confidence {intent.ai_confidence}")
            
        except Exception as e:
            logger.error(f"AI parsing failed for intent: {str(e)}")
            intent.parsed_parameters = {
                'natural_language': intent.natural_language,
                'intent_type': intent.intent_type,
                'error': str(e),
                'requires_manual_review': True
            }
            intent.ai_parsed = False
            intent.ai_confidence = 0.0
        
        # Save intent
        intent.save()
        
        # Serialize response
        response_serializer = IntentSerializer(intent)
        headers = self.get_success_headers(response_serializer.data)
        
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an intent for execution."""
        intent = self.get_object()
        
        if intent.status == 'ACTIVE':
            return Response(
                {'detail': 'Intent is already active.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if agent is active
        if not intent.agent.is_active:
            return Response(
                {'detail': 'Cannot activate intent because agent is inactive.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        intent.is_active = True
        intent.status = 'ACTIVE'
        
        # Set next execution time based on frequency
        if intent.execution_frequency == 'DAILY':
            intent.next_execution = timezone.now() + timezone.timedelta(days=1)
        elif intent.execution_frequency == 'WEEKLY':
            intent.next_execution = timezone.now() + timezone.timedelta(weeks=1)
        elif intent.execution_frequency == 'MONTHLY':
            intent.next_execution = timezone.now() + timezone.timedelta(days=30)
        # For ON_DEMAND, next_execution remains null
        
        intent.save()
        
        logger.info(f"Activated intent {intent.id} for agent {intent.agent.id}")
        
        return Response({
            'status': 'Intent activated',
            'next_execution': intent.next_execution,
            'intent': IntentSerializer(intent).data
        })
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause an intent."""
        intent = self.get_object()
        
        if not intent.is_active:
            return Response(
                {'detail': 'Intent is already inactive.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        intent.is_active = False
        intent.status = 'PAUSED'
        intent.next_execution = None
        intent.save()
        
        logger.info(f"Paused intent {intent.id} for agent {intent.agent.id}")
        
        return Response({
            'status': 'Intent paused',
            'intent': IntentSerializer(intent).data
        })
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """
        Manually execute an intent.
        This triggers AI analysis and potential transaction creation.
        """
        intent = self.get_object()
        
        # Check if intent is active
        if not intent.is_active:
            return Response(
                {'detail': 'Cannot execute inactive intent.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if agent is active
        if not intent.agent.is_active:
            return Response(
                {'detail': 'Cannot execute intent because agent is inactive.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user policy from profile
            try:
                profile = request.user.profile
                user_policy = {
                    'risk_tolerance': profile.risk_tolerance,
                    'preferred_chains': profile.preferred_chains,
                    'excluded_protocols': profile.excluded_protocols,
                    'max_gas_per_tx': float(profile.max_gas_per_tx),
                    'max_daily_limit': 10000.00  # Default, should come from policy contract
                }
            except UserProfile.DoesNotExist:
                user_policy = {}
            
            # Use AI to evaluate current conditions and generate actions
            execution_plan = ai_service.generate_execution_plan(
                intent=intent,
                user_policy=user_policy,
                market_context={}  # Would include real market data
            )
            
            # Update intent
            intent.last_executed = timezone.now()
            
            if intent.execution_frequency != 'ON_DEMAND':
                # Schedule next execution
                if intent.execution_frequency == 'DAILY':
                    intent.next_execution = timezone.now() + timezone.timedelta(days=1)
                elif intent.execution_frequency == 'WEEKLY':
                    intent.next_execution = timezone.now() + timezone.timedelta(weeks=1)
                elif intent.execution_frequency == 'MONTHLY':
                    intent.next_execution = timezone.now() + timezone.timedelta(days=30)
            
            intent.save()
            
            # Update agent stats
            agent = intent.agent
            agent.total_executions += 1
            agent.last_active = timezone.now()
            agent.save()
            
            logger.info(f"Executed intent {intent.id} with {len(execution_plan.get('actions', []))} actions")
            
            return Response({
                'status': 'Intent execution initiated',
                'execution_id': str(uuid.uuid4()),
                'plan': execution_plan,
                'actions_generated': len(execution_plan.get('actions', [])),
                'next_execution': intent.next_execution,
                'agent_performance': {
                    'total_executions': agent.total_executions,
                    'success_rate': agent.successful_executions / max(agent.total_executions, 1)
                }
            })
            
        except Exception as e:
            logger.error(f"Intent execution failed: {str(e)}")
            
            # Update agent failure stats
            intent.agent.failed_executions += 1
            intent.agent.save()
            
            return Response({
                'error': 'Intent execution failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for this intent."""
        intent = self.get_object()
        transactions = intent.transactions.all().order_by('-created_at')
        
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        """Get AI analysis of the intent."""
        intent = self.get_object()
        
        return Response({
            'intent_id': str(intent.id),
            'ai_parsed': intent.ai_parsed,
            'ai_confidence': intent.ai_confidence,
            'parsed_parameters': intent.parsed_parameters,
            'requires_review': intent.parsed_parameters.get('requires_manual_review', False),
            'suggested_improvements': ai_service.suggest_intent_improvements(intent)
        })


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Transactions.
    Create transactions through the propose endpoint.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only transactions belonging to the current user."""
        return Transaction.objects.filter(user=self.request.user).select_related(
            'intent', 'agent', 'user'
        ).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def propose(self, request):
        """
        Propose a new transaction for MPC signing.
        Includes AI policy validation.
        """
        serializer = TransactionProposalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the intent
        try:
            intent = Intent.objects.get(
                id=serializer.validated_data['intent_id'],
                user=request.user,
                is_active=True
            )
        except Intent.DoesNotExist:
            return Response(
                {'detail': 'Intent not found, inactive, or access denied.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if agent is active
        if not intent.agent.is_active:
            return Response(
                {'detail': 'Cannot propose transaction because agent is inactive.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create transaction
        transaction = Transaction.objects.create(
            intent=intent,
            agent=intent.agent,
            user=request.user,
            chain=serializer.validated_data['chain'],
            from_address=serializer.validated_data['from_address'],
            to_address=serializer.validated_data['to_address'],
            amount=serializer.validated_data['amount'],
            token_symbol=serializer.validated_data['token_symbol'],
            token_address=serializer.validated_data.get('token_address', ''),
            protocol=serializer.validated_data.get('protocol', ''),
            function_name=serializer.validated_data.get('function_name', ''),
            status='PENDING'
        )
        
        # Get user policy for AI validation
        try:
            profile = request.user.profile
            user_policy = {
                'risk_tolerance': profile.risk_tolerance,
                'preferred_chains': profile.preferred_chains,
                'excluded_protocols': profile.excluded_protocols,
                'max_gas_per_tx': float(profile.max_gas_per_tx),
                'max_daily_limit': 10000.00,
                'allowed_protocols': intent.parsed_parameters.get('constraints', {}).get('allowed_protocols', []),
                'max_slippage': intent.parsed_parameters.get('constraints', {}).get('max_slippage', 0.01)
            }
        except UserProfile.DoesNotExist:
            user_policy = {}
        
        # AI Policy Validation
        try:
            transaction_data = {
                'amount': float(transaction.amount),
                'chain': transaction.chain,
                'from_address': transaction.from_address,
                'to_address': transaction.to_address,
                'token_symbol': transaction.token_symbol,
                'protocol': transaction.protocol,
                'function_name': transaction.function_name
            }
            
            ai_validation = ai_service.evaluate_transaction_risk(
                transaction_data=transaction_data,
                policy_data=user_policy,
                intent_data=intent.parsed_parameters
            )
            
            # Create policy check record
            policy_check = PolicyCheck.objects.create(
                transaction=transaction,
                is_amount_within_limit=ai_validation.get('is_amount_within_limit', False),
                is_protocol_allowed=ai_validation.get('is_protocol_allowed', False),
                is_destination_allowed=ai_validation.get('is_destination_allowed', False),
                is_gas_within_limit=ai_validation.get('is_gas_within_limit', False),
                is_kyc_verified=ai_validation.get('is_kyc_verified', False),
                is_sanctions_compliant=ai_validation.get('is_sanctions_compliant', False),
                is_compliant=ai_validation.get('is_compliant', False),
                violation_reasons=ai_validation.get('violations', []),
                ai_confidence=ai_validation.get('confidence_score', 0.0)
            )
            
            # Update transaction based on AI validation
            if ai_validation.get('is_compliant', False):
                transaction.status = 'APPROVED'
                transaction.mpc_session_id = str(uuid.uuid4())  # Simulated MPC session
                
                # Here you would initiate actual MPC signing with Ika network
                # ika_service.initiate_mpc_signing(transaction, policy_check)
                
                logger.info(f"Transaction {transaction.id} approved by AI policy check")
                
                response_data = {
                    'status': 'Transaction approved for MPC signing',
                    'mpc_session_id': transaction.mpc_session_id,
                    'ai_validation': {
                        'compliant': True,
                        'confidence': ai_validation.get('confidence_score', 0.0),
                        'recommendation': ai_validation.get('recommendation', 'approve')
                    },
                    'transaction': TransactionSerializer(transaction).data,
                    'policy_check': PolicyCheckSerializer(policy_check).data
                }
                
            else:
                transaction.status = 'REJECTED'
                transaction.error_message = f"AI policy violation: {', '.join(ai_validation.get('violations', []))}"
                
                logger.warning(f"Transaction {transaction.id} rejected by AI policy check")
                
                response_data = {
                    'status': 'Transaction rejected',
                    'reason': 'Policy violation',
                    'violations': ai_validation.get('violations', []),
                    'ai_validation': {
                        'compliant': False,
                        'confidence': ai_validation.get('confidence_score', 0.0),
                        'recommendation': ai_validation.get('recommendation', 'reject'),
                        'suggestions': ai_validation.get('suggestions', [])
                    },
                    'transaction': TransactionSerializer(transaction).data,
                    'policy_check': PolicyCheckSerializer(policy_check).data
                }
            
            transaction.save()
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"AI policy validation failed: {str(e)}")
            
            # Mark transaction as failed
            transaction.status = 'FAILED'
            transaction.error_message = f"AI validation error: {str(e)}"
            transaction.save()
            
            return Response({
                'error': 'Policy validation failed',
                'detail': str(e),
                'transaction': TransactionSerializer(transaction).data
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def simulate_execution(self, request, pk=None):
        """
        Simulate transaction execution (for testing).
        In production, this would be handled by Ika MPC.
        """
        transaction = self.get_object()
        
        if transaction.status != 'APPROVED':
            return Response(
                {'detail': 'Transaction must be approved before execution.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simulate execution
        transaction.status = 'EXECUTED'
        transaction.executed_at = timezone.now()
        transaction.tx_hash = f"0x{uuid.uuid4().hex[:64]}"  # Simulated transaction hash
        transaction.gas_used = 0.001
        transaction.gas_price = 50.0
        
        # Update agent stats
        transaction.agent.total_executions += 1
        transaction.agent.successful_executions += 1
        transaction.agent.total_value_managed += transaction.amount
        transaction.agent.last_active = timezone.now()
        transaction.agent.save()
        
        # Update intent
        transaction.intent.last_executed = timezone.now()
        transaction.intent.save()
        
        transaction.save()
        
        logger.info(f"Simulated execution for transaction {transaction.id}")
        
        return Response({
            'status': 'Transaction execution simulated',
            'tx_hash': transaction.tx_hash,
            'executed_at': transaction.executed_at,
            'gas_cost': float(transaction.gas_used) * float(transaction.gas_price),
            'agent_updated': {
                'total_executions': transaction.agent.total_executions,
                'successful_executions': transaction.agent.successful_executions
            }
        })
    
    @action(detail=True, methods=['get'])
    def policy_check(self, request, pk=None):
        """Get policy check details for a transaction."""
        transaction = self.get_object()
        
        try:
            policy_check = transaction.policy_check
            serializer = PolicyCheckSerializer(policy_check)
            return Response(serializer.data)
        except PolicyCheck.DoesNotExist:
            return Response(
                {'detail': 'No policy check found for this transaction.'},
                status=status.HTTP_404_NOT_FOUND
            )


class PolicyCheckViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Policy Checks.
    """
    serializer_class = PolicyCheckSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only policy checks for the current user's transactions."""
        return PolicyCheck.objects.filter(
            transaction__user=self.request.user
        ).select_related('transaction').order_by('-checked_at')


class AgentAnalyticsView(APIView):
    """
    Analytics endpoint for agent performance.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get analytics for all user's agents."""
        user = request.user
        
        # Basic stats
        total_agents = Agent.objects.filter(user=user).count()
        active_agents = Agent.objects.filter(user=user, is_active=True).count()
        total_intents = Intent.objects.filter(user=user).count()
        active_intents = Intent.objects.filter(user=user, is_active=True).count()
        
        # Transaction stats
        transactions = Transaction.objects.filter(user=user)
        total_transactions = transactions.count()
        successful_transactions = transactions.filter(status='EXECUTED').count()
        failed_transactions = transactions.filter(status='FAILED').count()
        
        # Value managed
        total_value = transactions.filter(status='EXECUTED').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Agent type distribution
        agent_types = Agent.objects.filter(user=user).values('agent_type').annotate(
            count=Count('id')
        )
        
        # Success rate by agent
        agents_with_stats = []
        for agent in Agent.objects.filter(user=user):
            agent_tx = agent.transactions.all()
            agent_total = agent_tx.count()
            agent_success = agent_tx.filter(status='EXECUTED').count()
            
            agents_with_stats.append({
                'id': str(agent.id),
                'name': agent.name,
                'type': agent.agent_type,
                'total_executions': agent.total_executions,
                'success_rate': agent_success / max(agent_total, 1) if agent_total > 0 else 0,
                'total_value': float(agent.total_value_managed),
                'is_active': agent.is_active
            })
        
        # AI parsing stats
        ai_parsed_intents = Intent.objects.filter(user=user, ai_parsed=True).count()
        total_intents_parsed = Intent.objects.filter(user=user).count()
        ai_parsing_rate = ai_parsed_intents / max(total_intents_parsed, 1)
        
        return Response({
            'user': {
                'email': user.email,
                'wallet_address': user.wallet_address
            },
            'overview': {
                'total_agents': total_agents,
                'active_agents': active_agents,
                'total_intents': total_intents,
                'active_intents': active_intents,
                'total_transactions': total_transactions,
                'successful_transactions': successful_transactions,
                'failed_transactions': failed_transactions,
                'success_rate': successful_transactions / max(total_transactions, 1) if total_transactions > 0 else 0,
                'total_value_managed': float(total_value),
                'ai_parsing_rate': ai_parsing_rate
            },
            'agent_types': list(agent_types),
            'agents': agents_with_stats,
            'recent_activity': {
                'last_7_days_transactions': transactions.filter(
                    created_at__gte=timezone.now() - timezone.timedelta(days=7)
                ).count(),
                'last_30_days_intents': Intent.objects.filter(
                    user=user,
                    created_at__gte=timezone.now() - timezone.timedelta(days=30)
                ).count()
            }
        })


class EmergencyResponseView(APIView):
    """
    Emergency response and circuit breaker endpoints.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Trigger emergency response based on threat data.
        """
        threat_data = request.data.get('threat_data', {})
        
        if not threat_data:
            return Response(
                {'detail': 'Threat data is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use AI to generate emergency response
            emergency_plan = ai_service.generate_emergency_response(threat_data)
            
            # Get user's active agents
            active_agents = Agent.objects.filter(user=request.user, is_active=True)
            
            # Pause all agents (circuit breaker)
            paused_agents = []
            for agent in active_agents:
                agent.is_active = False
                agent.deactivated_at = timezone.now()
                agent.save()
                paused_agents.append(str(agent.id))
                
                # Pause all intents
                agent.intents.filter(is_active=True).update(
                    is_active=False,
                    status='PAUSED',
                    next_execution=None
                )
            
            # Create emergency transaction if needed
            emergency_transaction = None
            if emergency_plan.get('create_withdrawal', False):
                # This would create an actual withdrawal transaction
                emergency_transaction = {
                    'type': 'EMERGENCY_WITHDRAWAL',
                    'status': 'PENDING',
                    'created_at': timezone.now().isoformat()
                }
            
            logger.warning(f"Emergency response triggered for user {request.user.email}")
            
            return Response({
                'status': 'Emergency response activated',
                'emergency_plan': emergency_plan,
                'actions_taken': {
                    'agents_paused': paused_agents,
                    'total_agents_paused': len(paused_agents),
                    'emergency_transaction_created': emergency_transaction is not None
                },
                'next_steps': emergency_plan.get('recovery_steps', []),
                'severity': emergency_plan.get('severity', 'high'),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Emergency response failed: {str(e)}")
            return Response({
                'error': 'Emergency response failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        """
        Reset emergency state and reactivate agents.
        """
        try:
            # Reactivate all user's agents
            agents = Agent.objects.filter(user=request.user, is_active=False)
            reactivated = []
            
            for agent in agents:
                agent.is_active = True
                agent.deactivated_at = None
                agent.save()
                reactivated.append(str(agent.id))
            
            logger.info(f"Emergency reset for user {request.user.email}, reactivated {len(reactivated)} agents")
            
            return Response({
                'status': 'Emergency reset complete',
                'agents_reactivated': reactivated,
                'total_reactivated': len(reactivated),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Emergency reset failed: {str(e)}")
            return Response({
                'error': 'Emergency reset failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)