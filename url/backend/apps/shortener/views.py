"""
Shortener views — thin wrappers delegating to services and selectors.
"""

from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.utils import build_short_url, generate_qr_code

from . import selectors, services
from .serializers import (
    AnalyticsSerializer,
    ShortURLCreateSerializer,
    ShortURLResponseSerializer,
    ShortURLUpdateSerializer,
)


# ---------------------------------------------------------------------------
# CRUD views (authenticated)
# ---------------------------------------------------------------------------

class ShortURLListCreateView(APIView):
    """
    GET  /api/urls/      — list the authenticated user's URLs.
    POST /api/urls/      — create a new short URL.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        urls = selectors.get_user_short_urls(user=request.user)
        serializer = ShortURLResponseSerializer(urls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ShortURLCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        short_url = services.create_short_url(
            user=request.user,
            original_url=serializer.validated_data["original_url"],
            custom_key=serializer.validated_data.get("custom_key"),
            expires_at=serializer.validated_data.get("expires_at"),
        )
        return Response(
            ShortURLResponseSerializer(short_url).data,
            status=status.HTTP_201_CREATED,
        )


class ShortURLDetailView(APIView):
    """
    PATCH  /api/urls/{id}/ — update a short URL.
    DELETE /api/urls/{id}/ — delete a short URL.
    """

    permission_classes = [IsAuthenticated]

    def _get_object(self, request, url_id):
        short_url = selectors.get_short_url_by_id(url_id=url_id, user=request.user)
        if short_url is None:
            return None
        return short_url

    def patch(self, request, url_id):
        short_url = self._get_object(request, url_id)
        if short_url is None:
            return Response(
                {"error": "Not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ShortURLUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = services.update_short_url(
            short_url=short_url,
            original_url=serializer.validated_data.get("original_url"),
            expires_at=serializer.validated_data.get("expires_at"),
        )
        return Response(
            ShortURLResponseSerializer(updated).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, url_id):
        short_url = self._get_object(request, url_id)
        if short_url is None:
            return Response(
                {"error": "Not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        services.delete_short_url(short_url=short_url)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ShortURLAnalyticsView(APIView):
    """GET /api/urls/{id}/analytics/ — click analytics for a URL."""

    permission_classes = [IsAuthenticated]

    def get(self, request, url_id):
        short_url = selectors.get_short_url_by_id(url_id=url_id, user=request.user)
        if short_url is None:
            return Response(
                {"error": "Not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = selectors.get_analytics(short_url=short_url)
        serializer = AnalyticsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ShortURLQRCodeView(APIView):
    """GET /api/urls/{id}/qr/ — generate a QR code for the short URL."""

    permission_classes = [IsAuthenticated]

    def get(self, request, url_id):
        short_url = selectors.get_short_url_by_id(url_id=url_id, user=request.user)
        if short_url is None:
            return Response(
                {"error": "Not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        full_url = build_short_url(short_url.short_key)
        image_bytes = generate_qr_code(full_url)
        return HttpResponse(image_bytes, content_type="image/png")


# ---------------------------------------------------------------------------
# Public redirect view
# ---------------------------------------------------------------------------

class RedirectView(APIView):
    """GET /{short_key}/ — public redirect (no auth required)."""

    permission_classes = [AllowAny]
    authentication_classes = []  # skip JWT lookup for speed
    throttle_classes = []  # public redirects must not be throttled

    def get(self, request, short_key):
        original_url = services.resolve_and_track(
            short_key=short_key,
            request=request,
        )
        if original_url is None:
            return Response(
                {"error": "Short URL not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            status=status.HTTP_302_FOUND,
            headers={"Location": original_url},
        )
