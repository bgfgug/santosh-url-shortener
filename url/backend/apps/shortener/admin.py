from django.contrib import admin

from .models import ClickEvent, ShortURL


class ClickEventInline(admin.TabularInline):
    model = ClickEvent
    extra = 0
    readonly_fields = ("ip_address", "user_agent", "created_at")


@admin.register(ShortURL)
class ShortURLAdmin(admin.ModelAdmin):
    list_display = (
        "short_key",
        "original_url",
        "user",
        "click_count",
        "expires_at",
        "created_at",
    )
    list_filter = ("created_at", "expires_at")
    search_fields = ("short_key", "original_url", "user__email")
    readonly_fields = ("id", "short_key", "click_count", "created_at", "updated_at")
    inlines = [ClickEventInline]


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ("short_url", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("short_url__short_key", "ip_address")
    readonly_fields = ("created_at",)
