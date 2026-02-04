
from django.urls import path
from .views import SignupView, VerifyOtpView, LoginView, LogoutView, MeView, CSRFTokenView

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf-token'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('verify-otp/', VerifyOtpView.as_view(), name='verify-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
]
