from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api-keys', views.APIKeyViewSet, basename='api-key')

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('wallet/nonce/', views.WalletNonceView.as_view(), name='wallet-nonce'),
    path('wallet/login/', views.WalletLoginView.as_view(), name='wallet-login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('me/', views.UserView.as_view(), name='me'),
    path('generate-zk-proof/', views.GenerateZKProofView.as_view(), name='generate-zk-proof'),
    path('', include(router.urls)),
]