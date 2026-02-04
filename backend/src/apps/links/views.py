
from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.http import HttpResponseGone, HttpResponseNotFound
from .models import ShortLink
from .serializers import ShortLinkSerializer
from .services import LinkService

class LinkCreateListView(generics.ListCreateAPIView):
    serializer_class = ShortLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShortLink.objects.filter(owner=self.request.user).select_related('owner')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class LinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShortLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShortLink.objects.filter(owner=self.request.user)

class LinkRedirectView(View):
    def get(self, request, short_code):
        # 1. High speed lookup via Service (Redis -> DB)
        long_url = LinkService.get_destination_url(short_code)
        
        if not long_url:
            # Handle expired or not found
            if ShortLink.objects.filter(short_code=short_code).exists():
                return HttpResponseGone("<h1>410 Link Expired</h1>", content_type="text/html")
            return HttpResponseNotFound("<h1>404 Not Found</h1>", content_type="text/html")
        
        # 2. Asynchronous click tracking (buffered in Redis)
        meta = {
            'ip': self.get_client_ip(request),
            'ua': request.META.get('HTTP_USER_AGENT', ''),
            'ref': request.META.get('HTTP_REFERER', '')
        }
        LinkService.record_click(short_code, meta)
            
        return redirect(long_url)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
