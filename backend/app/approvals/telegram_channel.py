from app.approvals.base import ApprovalChannel, ApprovalRequest
from app.config import Settings


class TelegramApprovalChannel(ApprovalChannel):
    """Not wired to a bot yet — the shape the PRD's architecture calls for is here, but
    sending is stubbed out. Set APPROVAL_CHANNEL=email in .env to use the working channel."""

    name = "telegram"

    def __init__(self, settings: Settings):
        self._settings = settings

    def notify(self, request: ApprovalRequest) -> None:
        raise NotImplementedError(
            "TelegramApprovalChannel is a stub (P2 has no bot wiring yet). "
            "Set APPROVAL_CHANNEL=email in .env to use the working email channel."
        )
