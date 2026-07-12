import smtplib
from email.message import EmailMessage

from app.approvals.base import ApprovalChannel, ApprovalRequest
from app.config import Settings


class EmailApprovalChannel(ApprovalChannel):
    """Real, working channel for now — SMTP over Gmail (or any SMTP server). No new
    dependency: smtplib and email are stdlib."""

    name = "email"

    def __init__(self, settings: Settings):
        self._settings = settings

    def notify(self, request: ApprovalRequest) -> None:
        intent = request.intent
        message = EmailMessage()
        message["Subject"] = f"Janus approval needed: NGN {intent.amount_ngn} to {intent.recipient}"
        message["From"] = self._settings.approval_email_from or self._settings.smtp_username
        message["To"] = self._settings.approval_email_to
        message.set_content(
            "An agent wants to make a payment that needs your sign-off.\n\n"
            f"Amount:    NGN {intent.amount_ngn}\n"
            f"Recipient: {intent.recipient}\n"
            f"Category:  {intent.category}\n"
            f"Reason:    {intent.reason}\n\n"
            f"Why it needs approval: {request.decision_reason}\n\n"
            f"Review and respond: {request.review_url}\n\n"
            f"This request expires at {request.expires_at.isoformat()} — no reply defaults to deny."
        )

        with smtplib.SMTP(self._settings.smtp_host, self._settings.smtp_port) as smtp:
            smtp.starttls()
            smtp.login(self._settings.smtp_username, self._settings.smtp_password)
            smtp.send_message(message)
