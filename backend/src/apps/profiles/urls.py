
from django.urls import path
from .views import ProfileDetailUpdateView, PasswordChangeView

urlpatterns = [
    path('', ProfileDetailUpdateView.as_view(), name='profile-detail'),
    path('change-password/', PasswordChangeView.as_view(), name='password-change'),
]
