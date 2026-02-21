"""
Shortener service layer — all write operations and business logic.

Views call these functions; they never touch the ORM directly.
"""

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.common.utils import generate_short_key, get_client_ip
from core.exceptions import CustomKeyTaken, ShortKeyCollision, URLExpired
from core.logging import shortener_logger as logger

from .models import ClickEvent, ShortURL


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_short_url(
    *,
    user,
    original_url: str,
    custom_key: str | None = None,
    expires_at=None,
) -> ShortURL:
    """
    Create a new shortened URL.

    If *custom_key* is provided it is used directly (after uniqueness check).
    Otherwise a collision-safe random key is generated.
    """
    if custom_key:
        if ShortURL.objects.filter(short_key=custom_key).exists():
            raise CustomKeyTaken()
        short_key = custom_key
    else:
        try:
            short_key = generate_short_key(
                exists_fn=lambda k: ShortURL.objects.filter(short_key=k).exists()
            )
        except RuntimeError as exc:
            logger.error("Short key generation failed: %s", exc)
            raise ShortKeyCollision() from exc

    short_url = ShortURL.objects.create(
        user=user,
        original_url=original_url,
        short_key=short_key,
        custom_key=custom_key,
        expires_at=expires_at,
    )
    logger.info("Short URL created: %s → %s (user=%s)", short_key, original_url, user.id)
    return short_url


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

def update_short_url(
    *,
    short_url: ShortURL,
    original_url: str | None = None,
    expires_at=None,
    clear_expiry: bool = False,
) -> ShortURL:
    """
    Update mutable fields on an existing ShortURL.

    Pass ``clear_expiry=True`` to remove the expiration date.
    """
    if original_url is not None:
        short_url.original_url = original_url
    if clear_expiry:
        short_url.expires_at = None
    elif expires_at is not None:
        short_url.expires_at = expires_at

    short_url.save(update_fields=["original_url", "expires_at", "updated_at"])
    logger.info("Short URL updated: %s", short_url.short_key)
    return short_url


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

def delete_short_url(*, short_url: ShortURL) -> None:
    """Delete a ShortURL and its related click events (cascade)."""
    key = short_url.short_key
    short_url.delete()
    logger.info("Short URL deleted: %s", key)


# ---------------------------------------------------------------------------
# Redirect (the hot path)
# ---------------------------------------------------------------------------

@transaction.atomic
def resolve_and_track(*, short_key: str, request) -> str:
    """
    Resolve a short key to the original URL.

    1. Fetch the ShortURL (404 if not found — handled by the view).
    2. Check expiration (raise ``URLExpired`` → 410).
    3. Atomically increment ``click_count`` using an F expression.
    4. Record a ``ClickEvent``.
    5. Return the original URL.
    """
    try:
        short_url = ShortURL.objects.select_for_update().get(short_key=short_key)
    except ShortURL.DoesNotExist:
        return None  # View will return 404

    if short_url.expires_at and short_url.expires_at <= timezone.now():
        raise URLExpired()

    # Atomic increment
    ShortURL.objects.filter(pk=short_url.pk).update(click_count=F("click_count") + 1)

    # Record click event
    ClickEvent.objects.create(
        short_url=short_url,
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
    )

    logger.info("Redirect: %s → %s", short_key, short_url.original_url)
    return short_url.original_url
