"""API URL routing for the shortener app (mounted at /api/urls/)."""

from django.urls import path

from . import views

app_name = "shortener"

urlpatterns = [
    path("", views.ShortURLListCreateView.as_view(), name="list-create"),
    path("<uuid:url_id>/", views.ShortURLDetailView.as_view(), name="detail"),
    path("<uuid:url_id>/analytics/", views.ShortURLAnalyticsView.as_view(), name="analytics"),
    path("<uuid:url_id>/qr/", views.ShortURLQRCodeView.as_view(), name="qr-code"),
]
