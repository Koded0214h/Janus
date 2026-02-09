from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, APIKey
from cryptography.fernet import Fernet
import secrets
from django.conf import settings

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'confirm_password', 'wallet_address')
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            wallet_address=validated_data.get('wallet_address')
        )
        # DO NOT create profile here - the signal will handle it
        # UserProfile.objects.create(user=user)  # REMOVE THIS LINE
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError(_('Invalid credentials'))
            if not user.is_active:
                raise serializers.ValidationError(_('Account is disabled'))
        else:
            raise serializers.ValidationError(_('Must include email and password'))
        
        data['user'] = user
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    wallet_address = serializers.CharField(source='user.wallet_address', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'wallet_address', 'sui_address', 'is_verified',
                  'verification_level', 'is_active', 'date_joined', 'profile')
        read_only_fields = ('id', 'date_joined', 'is_verified')

class APIKeySerializer(serializers.ModelSerializer):
    key = serializers.CharField(read_only=True)
    secret = serializers.CharField(read_only=True)
    
    class Meta:
        model = APIKey
        fields = ('id', 'name', 'key', 'secret', 'is_active', 'permissions',
                  'last_used', 'created_at', 'expires_at')
        read_only_fields = ('key', 'secret', 'last_used', 'created_at')
    
    def create(self, validated_data):
        user = self.context['request'].user
        key = secrets.token_urlsafe(32)
        secret = secrets.token_urlsafe(32)
        
        api_key = APIKey.objects.create(
            user=user,
            name=validated_data['name'],
            key=key,
            secret=secret,
            permissions=validated_data.get('permissions', []),
            expires_at=validated_data.get('expires_at')
        )
        return api_key