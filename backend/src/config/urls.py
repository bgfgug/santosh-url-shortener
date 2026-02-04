
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from src.apps.links.views import LinkRedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('src.apps.auth_app.urls')),
    path('api/links/', include('src.apps.links.urls')),
    path('api/profiles/', include('src.apps.profiles.urls')),
    path('api/analytics/', include('src.apps.analytics.urls')),
    path('r/<str:short_code>/', LinkRedirectView.as_view(), name='redirect'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
