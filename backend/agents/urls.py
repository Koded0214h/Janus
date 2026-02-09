from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'agents', views.AgentViewSet, basename='agent')
router.register(r'intents', views.IntentViewSet, basename='intent')
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'policy-checks', views.PolicyCheckViewSet, basename='policy-check')

urlpatterns = [
    path('', include(router.urls)),
    path('transactions/propose/', views.TransactionViewSet.as_view({'post': 'propose'}), name='propose-transaction'),
]