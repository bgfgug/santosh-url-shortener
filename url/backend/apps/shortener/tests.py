"""
Tests for the shortener app — CRUD, redirect, analytics.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.shortener.models import ShortURL

User = get_user_model()


class ShortenerTestMixin:
    """Common setup for shortener tests."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="StrongPass123!"
        )
        self.client.force_authenticate(user=self.user)
        self.api_url = "/api/urls/"


class CreateShortURLTests(ShortenerTestMixin, TestCase):
    """POST /api/urls/"""

    def test_create_short_url(self):
        data = {"original_url": "https://www.example.com/long-path"}
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("short_key", response.data)
        self.assertEqual(response.data["original_url"], data["original_url"])

    def test_create_with_custom_key(self):
        data = {
            "original_url": "https://www.example.com",
            "custom_key": "mylink",
        }
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["short_key"], "mylink")

    def test_create_duplicate_custom_key(self):
        ShortURL.objects.create(
            user=self.user,
            original_url="https://existing.com",
            short_key="taken",
            custom_key="taken",
        )
        data = {"original_url": "https://www.example.com", "custom_key": "taken"}
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_with_invalid_url(self):
        data = {"original_url": "not-a-url"}
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_with_past_expiry(self):
        data = {
            "original_url": "https://www.example.com",
            "expires_at": (timezone.now() - timedelta(days=1)).isoformat(),
        }
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_requires_auth(self):
        self.client.force_authenticate(user=None)
        data = {"original_url": "https://www.example.com"}
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_custom_key_characters(self):
        data = {
            "original_url": "https://www.example.com",
            "custom_key": "bad key!",
        }
        response = self.client.post(self.api_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ListShortURLTests(ShortenerTestMixin, TestCase):
    """GET /api/urls/"""

    def test_list_own_urls(self):
        ShortURL.objects.create(
            user=self.user, original_url="https://a.com", short_key="aaa1111"
        )
        ShortURL.objects.create(
            user=self.user, original_url="https://b.com", short_key="bbb2222"
        )
        response = self.client.get(self.api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_cannot_see_other_users_urls(self):
        other_user = User.objects.create_user(
            username="other", email="other@example.com", password="pass1234"
        )
        ShortURL.objects.create(
            user=other_user, original_url="https://other.com", short_key="other11"
        )
        response = self.client.get(self.api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class UpdateShortURLTests(ShortenerTestMixin, TestCase):
    """PATCH /api/urls/{id}/"""

    def test_update_url(self):
        short_url = ShortURL.objects.create(
            user=self.user, original_url="https://old.com", short_key="upd1111"
        )
        response = self.client.patch(
            f"{self.api_url}{short_url.id}/",
            {"original_url": "https://new.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["original_url"], "https://new.com")


class DeleteShortURLTests(ShortenerTestMixin, TestCase):
    """DELETE /api/urls/{id}/"""

    def test_delete_url(self):
        short_url = ShortURL.objects.create(
            user=self.user, original_url="https://delete.me", short_key="del1111"
        )
        response = self.client.delete(f"{self.api_url}{short_url.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ShortURL.objects.filter(pk=short_url.pk).exists())


class RedirectTests(TestCase):
    """GET /{short_key}/"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="StrongPass123!"
        )

    def test_redirect_success(self):
        short_url = ShortURL.objects.create(
            user=self.user, original_url="https://www.example.com", short_key="rdr1111"
        )
        response = self.client.get(f"/{short_url.short_key}/")
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response["Location"], "https://www.example.com")

    def test_redirect_not_found(self):
        response = self.client.get("/nonexistent/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_redirect_expired(self):
        ShortURL.objects.create(
            user=self.user,
            original_url="https://expired.com",
            short_key="exp1111",
            expires_at=timezone.now() - timedelta(hours=1),
        )
        response = self.client.get("/exp1111/")
        self.assertEqual(response.status_code, status.HTTP_410_GONE)

    def test_redirect_increments_click_count(self):
        short_url = ShortURL.objects.create(
            user=self.user, original_url="https://clicks.com", short_key="clk1111"
        )
        self.client.get(f"/{short_url.short_key}/")
        self.client.get(f"/{short_url.short_key}/")
        short_url.refresh_from_db()
        self.assertEqual(short_url.click_count, 2)

    def test_redirect_creates_click_event(self):
        short_url = ShortURL.objects.create(
            user=self.user, original_url="https://events.com", short_key="evt1111"
        )
        self.client.get(f"/{short_url.short_key}/")
        self.assertEqual(short_url.click_events.count(), 1)


class AnalyticsTests(ShortenerTestMixin, TestCase):
    """GET /api/urls/{id}/analytics/"""

    def test_analytics(self):
        short_url = ShortURL.objects.create(
            user=self.user, original_url="https://analytics.com", short_key="anl1111"
        )
        # Simulate a click via redirect
        self.client.force_authenticate(user=None)
        self.client.get(f"/{short_url.short_key}/")
        # Now query analytics as authenticated user
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"{self.api_url}{short_url.id}/analytics/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["click_count"], 1)
        self.assertEqual(len(response.data["recent_clicks"]), 1)

    def test_analytics_not_found(self):
        import uuid

        response = self.client.get(f"{self.api_url}{uuid.uuid4()}/analytics/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
