"""
Application-wide constants.

All magic numbers / defaults are defined here so they can be changed in one
place and imported anywhere.
"""

# ---------------------------------------------------------------------------
# Short key generation
# ---------------------------------------------------------------------------
BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
SHORT_KEY_LENGTH = 7
SHORT_KEY_MAX_RETRIES = 5
SHORT_KEY_REGEX = r"^[A-Za-z0-9]+$"

# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------
DEFAULT_PAGE_SIZE = 20

# ---------------------------------------------------------------------------
# Expiration
# ---------------------------------------------------------------------------
DEFAULT_EXPIRATION_DAYS = 30

# ---------------------------------------------------------------------------
# Throttle descriptors (rates live in settings, these are just labels)
# ---------------------------------------------------------------------------
THROTTLE_ANON_BURST = "anon_burst"
THROTTLE_ANON_SUSTAINED = "anon_sustained"
THROTTLE_USER_BURST = "user_burst"
THROTTLE_USER_SUSTAINED = "user_sustained"

# ---------------------------------------------------------------------------
# QR code
# ---------------------------------------------------------------------------
QR_BOX_SIZE = 10
QR_BORDER = 4
