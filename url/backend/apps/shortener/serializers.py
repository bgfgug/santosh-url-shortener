"""
Shortener serializers — validation and transformation only.
"""

import re

from django.utils import timezone
from rest_framework import serializers

from apps.common.constants import SHORT_KEY_REGEX
from apps.common.utils import build_short_url

from .models import ClickEvent, ShortURL


class ShortURLCreateSerializer(serializers.Serializer):
    """Validate input for creating a shortened URL."""

    original_url = serializers.URLField(max_length=2048)
    custom_key = serializers.CharField(max_length=20, required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_custom_key(self, value):
        if value and not re.match(SHORT_KEY_REGEX, value):
            raise serializers.ValidationError(
                "Custom key must contain only alphanumeric characters."
            )
        if value and len(value) < 3:
            raise serializers.ValidationError(
                "Custom key must be at least 3 characters long."
            )
        return value or None

    def validate_expires_at(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError(
                "Expiration date must be in the future."
            )
        return value


class ShortURLUpdateSerializer(serializers.Serializer):
    """Validate input for updating a shortened URL."""

    original_url = serializers.URLField(max_length=2048, required=False)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_expires_at(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError(
                "Expiration date must be in the future."
            )
        return value


class ShortURLResponseSerializer(serializers.ModelSerializer):
    """Read-only representation of a ShortURL."""

    short_url = serializers.SerializerMethodField()

    class Meta:
        model = ShortURL
        fields = (
            "id",
            "original_url",
            "short_key",
            "short_url",
            "custom_key",
            "click_count",
            "expires_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_short_url(self, obj) -> str:
        return build_short_url(obj.short_key)


class ClickEventSerializer(serializers.ModelSerializer):
    """Read-only representation of a ClickEvent."""

    class Meta:
        model = ClickEvent
        fields = ("id", "ip_address", "user_agent", "created_at")
        read_only_fields = fields


class AnalyticsSerializer(serializers.Serializer):
    """Analytics response for a ShortURL."""

    short_url = ShortURLResponseSerializer()
    click_count = serializers.IntegerField()
    recent_clicks = ClickEventSerializer(many=True)
