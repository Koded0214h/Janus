class JanusError(Exception):
    """Base for every error this client raises."""


class JanusAuthError(JanusError):
    """The API key was missing or wrong (HTTP 401)."""


class JanusAPIError(JanusError):
    """Any other non-2xx response."""

    def __init__(self, status_code: int, body: str):
        self.status_code = status_code
        self.body = body
        super().__init__(f"Janus API returned {status_code}: {body}")
