from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activity/', views.ActivityFeedView.as_view(), name='activity-feed'),
    path('dashboard/portfolio/', views.PortfolioView.as_view(), name='portfolio'),
    path('intents/execute/', views.IntentExecutionView.as_view(), name='execute-intent'),
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
]