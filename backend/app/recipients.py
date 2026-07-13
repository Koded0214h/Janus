"""Maps the logical recipient names used in policy/intents to real bank account details.

Kept separate from PolicyConfig on purpose: the policy only needs to know *whether* a
recipient is allowed, the executor needs to know *how to pay* them. Keep this file's keys
in sync with the policy's allowed_recipients — a recipient can be allow-listed with no
directory entry, which will fail loudly at execution time rather than silently misroute funds.
"""

import json
from dataclasses import dataclass
from pathlib import Path

RECIPIENTS_FILE = Path(__file__).resolve().parent.parent / "recipients.json"


@dataclass(frozen=True)
class RecipientDetails:
    name: str
    account_number: str
    bank_code: str


def _load() -> dict[str, RecipientDetails]:
    if not RECIPIENTS_FILE.exists():
        return {}
    raw = json.loads(RECIPIENTS_FILE.read_text())
    return {
        recipient_id: RecipientDetails(
            name=details["name"],
            account_number=details["account_number"],
            bank_code=details["bank_code"],
        )
        for recipient_id, details in raw.items()
    }


def get_recipient(recipient_id: str) -> RecipientDetails | None:
    return _load().get(recipient_id)
