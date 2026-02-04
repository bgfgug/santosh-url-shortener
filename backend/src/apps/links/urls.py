
from django.urls import path
from .views import LinkCreateListView, LinkDetailView

urlpatterns = [
    path('', LinkCreateListView.as_view(), name='link-list-create'),
    path('<int:pk>/', LinkDetailView.as_view(), name='link-detail'),
]
