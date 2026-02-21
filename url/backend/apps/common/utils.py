"""
Utility functions shared across apps.

• Base62 encoding / decoding
• Collision-safe short key generation
• IP address extraction from request
• QR code generation
"""

import io
import random

import qrcode
from django.conf import settings

from .constants import (
    BASE62_ALPHABET,
    QR_BOX_SIZE,
    QR_BORDER,
    SHORT_KEY_LENGTH,
    SHORT_KEY_MAX_RETRIES,
)


# ---------------------------------------------------------------------------
# Base62 helpers
# ---------------------------------------------------------------------------

def base62_encode(number: int) -> str:
    """
    Encode a non-negative integer into a Base62 string.

    >>> base62_encode(0)
    '0'
    >>> base62_encode(61)
    'z'
    """
    if number < 0:
        raise ValueError("Cannot Base62-encode a negative number.")
    if number == 0:
        return BASE62_ALPHABET[0]

    chars = []
    base = len(BASE62_ALPHABET)
    while number:
        number, remainder = divmod(number, base)
        chars.append(BASE62_ALPHABET[remainder])
    return "".join(reversed(chars))


def base62_decode(encoded: str) -> int:
    """Decode a Base62-encoded string back to an integer."""
    base = len(BASE62_ALPHABET)
    number = 0
    for char in encoded:
        number = number * base + BASE62_ALPHABET.index(char)
    return number


# ---------------------------------------------------------------------------
# Short key generation
# ---------------------------------------------------------------------------

def generate_short_key(
    exists_fn: callable,
    length: int = SHORT_KEY_LENGTH,
    max_retries: int = SHORT_KEY_MAX_RETRIES,
) -> str:
    """
    Generate a collision-safe short key.

    Parameters
    ----------
    exists_fn : callable
        A function that accepts a key string and returns ``True`` if the key
        already exists in the database (e.g.
        ``ShortURL.objects.filter(short_key=key).exists``).
    length : int
        Desired character length of the generated key.
    max_retries : int
        Number of retries before raising an error.

    Returns
    -------
    str
        A unique Base62 short key.

    Raises
    ------
    RuntimeError
        If a unique key cannot be generated within *max_retries* attempts.
    """
    upper_bound = len(BASE62_ALPHABET) ** length
    for _ in range(max_retries):
        number = random.randint(0, upper_bound - 1)
        key = base62_encode(number).ljust(length, BASE62_ALPHABET[0])[:length]
        if not exists_fn(key):
            return key
    raise RuntimeError(
        f"Failed to generate a unique short key after {max_retries} retries."
    )


# ---------------------------------------------------------------------------
# IP extraction
# ---------------------------------------------------------------------------

def get_client_ip(request) -> str:
    """
    Extract the client IP address from the request, honoring
    ``X-Forwarded-For`` when behind a reverse proxy.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "0.0.0.0")


# ---------------------------------------------------------------------------
# QR code generation
# ---------------------------------------------------------------------------

def generate_qr_code(url: str) -> bytes:
    """
    Generate a PNG QR code image for *url* and return it as raw bytes.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=QR_BOX_SIZE,
        border=QR_BORDER,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def build_short_url(short_key: str) -> str:
    """Build the full short URL from the short key using the configured base."""
    base = settings.SHORT_URL_BASE.rstrip("/")
    return f"{base}/{short_key}"
