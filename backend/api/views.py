from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum, Q
from agents.models import Agent, Intent, Transaction
from users.models import UserProfile
from .serializers import (
    DashboardStatsSerializer,
    ActivityFeedSerializer,
    PortfolioAllocationSerializer,
    IntentExecutionSerializer
)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Calculate stats
        total_agents = Agent.objects.filter(user=user).count()
        active_agents = Agent.objects.filter(user=user, is_active=True).count()
        
        total_intents = Intent.objects.filter(user=user).count()
        active_intents = Intent.objects.filter(user=user, is_active=True).count()
        
        total_transactions = Transaction.objects.filter(user=user).count()
        successful_transactions = Transaction.objects.filter(
            user=user, 
            status='EXECUTED'
        ).count()
        
        total_value_managed = Transaction.objects.filter(
            user=user,
            status='EXECUTED'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        compliance_rate = 0
        if total_transactions > 0:
            compliant_transactions = Transaction.objects.filter(
                user=user,
                status='EXECUTED'
            ).count()
            compliance_rate = (compliant_transactions / total_transactions) * 100
        
        stats = {
            'total_agents': total_agents,
            'active_agents': active_agents,
            'total_intents': total_intents,
            'active_intents': active_intents,
            'total_transactions': total_transactions,
            'successful_transactions': successful_transactions,
            'total_value_managed': total_value_managed,
            'compliance_rate': round(compliance_rate, 2)
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

class ActivityFeedView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        last_24_hours = timezone.now() - timedelta(hours=24)
        
        activities = []
        
        # Recent transactions
        recent_transactions = Transaction.objects.filter(
            user=user,
            created_at__gte=last_24_hours
        ).order_by('-created_at')[:10]
        
        for tx in recent_transactions:
            activities.append({
                'timestamp': tx.created_at,
                'type': 'transaction',
                'action': f'{tx.status.lower()}_transaction',
                'details': {
                    'amount': str(tx.amount),
                    'token': tx.token_symbol,
                    'chain': tx.chain,
                    'tx_hash': tx.tx_hash
                },
                'user_email': user.email
            })
        
        # Recent intents
        recent_intents = Intent.objects.filter(
            user=user,
            created_at__gte=last_24_hours
        ).order_by('-created_at')[:5]
        
        for intent in recent_intents:
            activities.append({
                'timestamp': intent.created_at,
                'type': 'intent',
                'action': 'created_intent',
                'details': {
                    'type': intent.intent_type,
                    'description': intent.natural_language[:100] + '...'
                },
                'user_email': user.email
            })
        
        # Sort by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        serializer = ActivityFeedSerializer(activities[:15], many=True)
        return Response(serializer.data)

class PortfolioView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # This is a simplified example - in production, you'd query blockchain data
        user = request.user
        
        # Mock portfolio data - in reality, you'd aggregate from transactions
        portfolio = [
            {
                'chain': 'SUI',
                'token_symbol': 'SUI',
                'amount': 1000,
                'value_usd': 500.00,
                'percentage': 50.0
            },
            {
                'chain': 'ETH',
                'token_symbol': 'ETH',
                'amount': 2,
                'value_usd': 400.00,
                'percentage': 40.0
            },
            {
                'chain': 'BTC',
                'token_symbol': 'BTC',
                'amount': 0.05,
                'value_usd': 100.00,
                'percentage': 10.0
            }
        ]
        
        serializer = PortfolioAllocationSerializer(portfolio, many=True)
        return Response(serializer.data)

class IntentExecutionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Execute an intent immediately"""
        intent_id = request.data.get('intent_id')
        
        if not intent_id:
            return Response(
                {'error': 'intent_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            intent = Intent.objects.get(id=intent_id, user=request.user)
        except Intent.DoesNotExist:
            return Response(
                {'error': 'Intent not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # In production, this would trigger the actual execution pipeline
        # For now, we return a mock response
        
        execution_data = {
            'intent_id': intent.id,
            'natural_language': intent.natural_language,
            'parsed_parameters': intent.parsed_parameters,
            'expected_outcome': 'Portfolio rebalanced according to policy',
            'risk_level': 'LOW'
        }
        
        serializer = IntentExecutionSerializer(execution_data)
        return Response({
            'message': 'Intent execution initiated',
            'execution': serializer.data,
            'mpc_session_started': True
        })

class HealthCheckView(APIView):
    permission_classes = []
    
    def get(self, request):
        health_status = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0-alpha',
            'dependencies': {
                'database': 'connected',
                'redis': 'connected',  # Would check actual connection
                'sui_node': 'connected',  # Would check Sui node
                'ika_network': 'connected'  # Would check Ika network
            }
        }
        return Response(health_status)