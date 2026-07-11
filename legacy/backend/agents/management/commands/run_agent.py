import time
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from agents.models import Intent, Agent
from agents.views import IntentViewSet
from django.test import RequestFactory
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Runs the Janus AI Agent in autonomous mode. Periodically executes active intents."

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Interval in seconds between execution loops (default: 60)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        self.stdout.write(self.style.SUCCESS(f"Starting Janus Autonomous Agent (Interval: {interval}s)..."))

        factory = RequestFactory()

        while True:
            try:
                # 1. Fetch all active intents that are due for execution
                # For this prototype, we check every active intent in the loop
                active_intents = Intent.objects.filter(is_active=True, status='ACTIVE')
                
                if not active_intents.exists():
                    self.stdout.write("No active intents found. Waiting...")
                else:
                    for intent in active_intents:
                        # Skip if it has a next_execution time in the future
                        if intent.next_execution and intent.next_execution > timezone.now():
                            continue

                        self.stdout.write(f"Executing Intent: {intent.natural_language[:50]}...")
                        
                        # Trigger execution logic using the ViewSet
                        # We mock the request so we can reuse the existing logic in views.py
                        request = factory.post(f'/api/intents/{intent.id}/execute/')
                        request.user = intent.user
                        
                        # Wrap in DRF Request
                        drf_request = Request(request, authenticators=[JWTAuthentication()])
                        drf_request.user = intent.user
                        
                        view = IntentViewSet.as_view({'post': 'execute'})
                        
                        try:
                            response = view(drf_request, pk=str(intent.id))
                            if response.status_code == 200:
                                self.stdout.write(self.style.SUCCESS(f"Successfully executed intent {intent.id}"))
                            else:
                                self.stdout.write(self.style.WARNING(f"Failed to execute intent {intent.id}: {response.data}"))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"Error executing intent {intent.id}: {str(e)}"))

                self.stdout.write(f"Loop complete. Sleeping for {interval}s...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                self.stdout.write(self.style.SUCCESS("Janus Agent stopped."))
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Unexpected error in agent loop: {str(e)}"))
                time.sleep(10)
