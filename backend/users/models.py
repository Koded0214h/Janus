from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from cryptography.fernet import Fernet
from django.conf import settings
import json

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    wallet_address = models.CharField(max_length=255, blank=True, null=True)
    sui_address = models.CharField(max_length=255, blank=True, null=True)
    
    # Identity verification
    is_verified = models.BooleanField(default=False)
    verification_level = models.CharField(
        max_length=20,
        choices=[
            ('BASIC', 'Basic'),
            ('ENHANCED', 'Enhanced'),
            ('INSTITUTIONAL', 'Institutional'),
        ],
        default='BASIC'
    )
    quadrata_did = models.CharField(max_length=255, blank=True, null=True)
    
    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
    # Preferences
    notification_email = models.BooleanField(default=True)
    notification_push = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    
    # Security
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)
    recovery_phrase = models.TextField(blank=True, null=True)  # Encrypted
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

    def encrypt_data(self, data):
        """Encrypt sensitive data"""
        cipher = Fernet(settings.ENCRYPTION_KEY.encode())
        return cipher.encrypt(json.dumps(data).encode()).decode()

    def decrypt_data(self, encrypted_data):
        """Decrypt sensitive data"""
        cipher = Fernet(settings.ENCRYPTION_KEY.encode())
        return json.loads(cipher.decrypt(encrypted_data.encode()).decode())

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Risk profile
    risk_tolerance = models.CharField(
        max_length=20,
        choices=[
            ('CONSERVATIVE', 'Conservative'),
            ('MODERATE', 'Moderate'),
            ('AGGRESSIVE', 'Aggressive'),
        ],
        default='MODERATE'
    )
    
    # Investment preferences
    preferred_chains = models.JSONField(default=list)  # ['SUI', 'ETH', 'BTC']
    excluded_protocols = models.JSONField(default=list)
    max_gas_per_tx = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email}"

class APIKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=64, unique=True)
    secret = models.CharField(max_length=64)
    is_active = models.BooleanField(default=True)
    permissions = models.JSONField(default=list)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.user.email}"