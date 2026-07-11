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
    """
    if created:
        UserProfile.objects.get_or_create(user=instance)
        logger.info(f"Profile created for user: {instance.email}")
