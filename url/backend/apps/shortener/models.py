"""
Shortener domain models — ShortURL and ClickEvent.
"""

import uuid

from django.conf import settings
from django.db import models


class ShortURL(models.Model):
    """A shortened URL owned by a user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="short_urls",
    )
    original_url = models.URLField(max_length=2048)
    short_key = models.CharField(max_length=20, unique=True, db_index=True)
    custom_key = models.CharField(max_length=20, blank=True, null=True)
    click_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "short_urls"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"], name="idx_user_created"),
        ]

    def __str__(self) -> str:
        return f"{self.short_key} → {self.original_url[:60]}"


class ClickEvent(models.Model):
    """Records a single redirect / click on a ShortURL."""

    id = models.BigAutoField(primary_key=True)
    short_url = models.ForeignKey(
        ShortURL,
        on_delete=models.CASCADE,
        related_name="click_events",
    )
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "click_events"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Click on {self.short_url.short_key} from {self.ip_address}"
