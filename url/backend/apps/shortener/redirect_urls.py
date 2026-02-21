"""Public redirect URL routing (mounted at / in root URLconf)."""

from django.urls import path

from . import views

app_name = "redirect"

urlpatterns = [
    path("<str:short_key>/", views.RedirectView.as_view(), name="redirect"),
]
