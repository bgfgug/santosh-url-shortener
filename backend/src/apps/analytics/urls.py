
from django.urls import path
from .views import GlobalAnalyticsListView, LinkAnalyticsListView

urlpatterns = [
    path('logs/', GlobalAnalyticsListView.as_view(), name='global-analytics'),
    path('logs/<int:link_id>/', LinkAnalyticsListView.as_view(), name='link-analytics'),
]
