"""Root URL configuration for url_shortener project."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/urls/", include("apps.shortener.urls", namespace="shortener-api")),
    # Redirect endpoint — must be last to avoid prefix collisions
    path("", include("apps.shortener.redirect_urls", namespace="shortener-redirect")),
]
