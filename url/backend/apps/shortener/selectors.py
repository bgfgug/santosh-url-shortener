"""
Shortener selectors — read-only query logic.

These functions return optimised QuerySets for listing and analytics.
Views call selectors for reads and services for writes.
"""

from .models import ClickEvent, ShortURL


def get_user_short_urls(*, user):
    """Return all ShortURLs for *user*, newest first."""
    return ShortURL.objects.filter(user=user).order_by("-created_at")


def get_short_url_by_id(*, url_id, user):
    """Return a single ShortURL owned by *user*, or ``None``."""
    return ShortURL.objects.filter(pk=url_id, user=user).first()


def get_analytics(*, short_url: ShortURL, limit: int = 50) -> dict:
    """
    Return analytics for a ShortURL:
    – the ShortURL itself
    – total click_count
    – most recent *limit* click events (select_related to avoid N+1)
    """
    recent_clicks = (
        ClickEvent.objects
        .filter(short_url=short_url)
        .order_by("-created_at")[:limit]
    )
    return {
        "short_url": short_url,
        "click_count": short_url.click_count,
        "recent_clicks": recent_clicks,
    }
