from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import User, UserProfile, APIKey
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a UserProfile automatically when a new User is created.
    Only create if profile doesn't already exist.
    """
    if created:
        # Check if profile already exists (shouldn't, but just in case)
        if not hasattr(instance, 'profile'):
            UserProfile.objects.create(user=instance)
            logger.info(f"Created profile for user: {instance.email}")
        else:
            logger.debug(f"Profile already exists for user: {instance.email}")

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Send welcome email when a new user registers.
    """
    if created and not instance.is_superuser:
        try:
            subject = 'Welcome to Janus Protocol - Your Secure Digital Assistant'
            message = f"""
            Hello {instance.email},
            
            Welcome to Janus Protocol! Your account has been successfully created.
            
            Janus is your AI-native execution layer that empowers you to:
            - Automate complex on-chain transactions safely
            - Set natural language policies for your AI agents
            - Protect your assets with split-key custody
            - Access institutional DeFi with privacy
            
            Next steps:
            1. Complete your profile to get personalized recommendations
            2. Create your first AI agent
            3. Set up your security preferences
            
            Stay secure,
            The Janus Team
            
            ---
            Important: Never share your private keys or recovery phrases with anyone.
            """
            
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [instance.email]
            
            send_mail(subject, message, from_email, recipient_list, fail_silently=True)
            logger.info(f"Welcome email sent to: {instance.email}")
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {instance.email}: {str(e)}")

# Remove or comment out the save_user_profile signal as it's not needed


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a UserProfile automatically when a new User is created.
    """
    if created:
        # Use get_or_create to handle race conditions
        UserProfile.objects.get_or_create(user=instance)
        logger.info(f"Profile ensured for user: {instance.email}")
