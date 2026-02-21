from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        
        if header is None:
            # Try to get token from cookies
            access_token = request.COOKIES.get('access_token')
            if access_token:
                validated_token = self.get_validated_token(access_token)
                return self.get_user(validated_token), validated_token
            return None

        return super().authenticate(request)
