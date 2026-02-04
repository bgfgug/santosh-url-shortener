
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import SignupSerializer, OtpVerifySerializer, LoginSerializer, UserSerializer
from .services import AuthService

class CSRFTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        """Priming endpoint to set the CSRF cookie."""
        return Response({"detail": "CSRF cookie set"}, status=status.HTTP_200_OK)

class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            try:
                AuthService.create_inactive_user(
                    serializer.validated_data['email'],
                    serializer.validated_data['password']
                )
                return Response({"message": "Verification code sent to your email."}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"non_field_errors": [str(e)]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        if serializer.is_valid():
            try:
                AuthService.verify_otp(
                    serializer.validated_data['email'],
                    serializer.validated_data['otp_code']
                )
                return Response({"message": "Account verified successfully."}, status=status.HTTP_200_OK)
            except ValueError as e:
                return Response({"non_field_errors": [str(e)]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = AuthService.login_user(
                    serializer.validated_data['email'],
                    serializer.validated_data['password']
                )
                login(request, user)
                return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
            except PermissionError as e:
                return Response({"non_field_errors": [str(e)]}, status=status.HTTP_403_FORBIDDEN)
            except ValueError as e:
                return Response({"non_field_errors": [str(e)]}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
