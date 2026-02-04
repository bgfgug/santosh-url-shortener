
from rest_framework import generics, permissions
from .models import LinkClick
from .serializers import LinkClickSerializer
from src.apps.links.models import ShortLink

class GlobalAnalyticsListView(generics.ListAPIView):
    """List all clicks across all links owned by the user."""
    serializer_class = LinkClickSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LinkClick.objects.filter(link__owner=self.request.user)

class LinkAnalyticsListView(generics.ListAPIView):
    """List clicks for a specific short link."""
    serializer_class = LinkClickSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        link_id = self.kwargs.get('link_id')
        return LinkClick.objects.filter(link__id=link_id, link__owner=self.request.user)
