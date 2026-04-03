from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, UserProfile, APIKey
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileSerializer,
    APIKeySerializer
)
from rest_framework.permissions import IsAuthenticated

import secrets
from eth_account.messages import encode_defunct
from eth_account import Account

class WalletNonceView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        if not wallet_address:
            return Response({'error': 'wallet_address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        wallet_address = wallet_address.lower()
        nonce = secrets.token_urlsafe(32)
        
        user, created = User.objects.get_or_create(
            wallet_address=wallet_address,
            defaults={'email': f"{wallet_address}@janus.internal"}
        )
        user.nonce = nonce
        user.save()
        
        return Response({'nonce': nonce})

class WalletLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        
        if not wallet_address or not signature:
            return Response({'error': 'wallet_address and signature are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        wallet_address = wallet_address.lower()
        try:
            user = User.objects.get(wallet_address=wallet_address)
        except User.DoesNotExist:
            return Response({'error': 'User not found. Get nonce first.'}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.nonce:
            return Response({'error': 'Nonce not generated.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify signature
        message = encode_defunct(text=f"Janus Auth Nonce: {user.nonce}")
        try:
            signer = Account.recover_message(message, signature=signature)
            if signer.lower() != wallet_address:
                return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': f'Signature verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Clear nonce
        user.nonce = None
        user.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

class UserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        # Don't allow updating sensitive fields through this endpoint
        restricted_fields = ['password', 'is_staff', 'is_superuser']
        for field in restricted_fields:
            if field in request.data:
                return Response(
                    {'error': f'Cannot update {field} through this endpoint'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().update(request, *args, **kwargs)

class APIKeyViewSet(viewsets.ModelViewSet):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class GenerateZKProofView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        proof_type = request.data.get('proof_type', 'HUMAN')
        
        # In a real app, this would integrate with a ZK prover service
        # For the prototype, we'll simulate proof generation and update status
        
        # If user isn't verified yet, verify them as part of the proof generation simulation
        if not user.is_verified:
            user.is_verified = True
            if user.verification_level == 'BASIC':
                user.verification_level = 'ENHANCED'
            user.save()
            
        proof_id = f"0x{secrets.token_hex(32)}"
        
        return Response({
            'status': 'success',
            'proof_id': proof_id,
            'proof_type': proof_type,
            'user_verified': user.is_verified,
            'verification_level': user.verification_level,
            'timestamp': timezone.now().isoformat()
        })