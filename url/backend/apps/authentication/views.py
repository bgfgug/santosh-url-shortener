"""
Authentication views — thin wrappers that delegate to the service layer.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(APIView):
    """POST /api/auth/register/"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: Registration validation failed: {serializer.errors}")
            serializer.is_valid(raise_exception=True)
        serializer.is_valid(raise_exception=True)
        user = services.register_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        
        # Auto-login after registration
        login_result = services.login_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"]
        )
        
        response = Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

        # Set HTTP-only cookies
        from django.conf import settings
        response.set_cookie(
            key="access_token",
            value=login_result["access"],
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
        )
        response.set_cookie(
            key="refresh_token",
            value=login_result["refresh"],
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
        )
        
        return response


class LoginView(APIView):
    """POST /api/auth/login/"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = services.login_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if result is None:
            return Response(
                {"error": "Invalid credentials.", "code": "INVALID_CREDENTIALS"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        response = Response(
            {
                "user": UserSerializer(result["user"]).data,
            },
            status=status.HTTP_200_OK,
        )

        # Set HTTP-only cookies
        from django.conf import settings
        response.set_cookie(
            key="access_token",
            value=result["access"],
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
        )
        response.set_cookie(
            key="refresh_token",
            value=result["refresh"],
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
        )

        return response


class LogoutView(APIView):
    """POST /api/auth/logout/"""

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"error": "No active session found.", "code": "VALIDATION_ERROR"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        success = services.logout_user(refresh_token=refresh_token)
        
        response = Response(
            {"message": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )

        # Clear cookies
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response
