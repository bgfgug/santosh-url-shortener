
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.core.cache import cache
from .models import OTP
from src.shared.otp import generate_otp_code
from src.shared.email import send_otp_email

class AuthService:
    OTP_TTL = 600  # 10 minutes

    @staticmethod
    def create_inactive_user(email, password):
        with transaction.atomic():
            user = User.objects.create_user(username=email, email=email, password=password)
            user.is_active = False
            user.save()
            
            otp_code = generate_otp_code()
            
            # Redis Storage (Primary Verification Path)
            cache.set(f"otp:{email}", otp_code, timeout=AuthService.OTP_TTL)
            
            # DB Storage (Persistence/Audit Path)
            OTP.objects.create(user=user, code=otp_code)
            
            send_otp_email(email, otp_code)
            return user

    @staticmethod
    def verify_otp(email, code):
        # 1. Try Redis for instant verification
        cached_otp = cache.get(f"otp:{email}")
        
        if cached_otp:
            if cached_otp == code:
                AuthService._activate_user(email)
                cache.delete(f"otp:{email}")
                return True
            raise ValueError("Invalid verification code.")
        
        # 2. Fallback to DB if Redis key expired or missed
        try:
            user = User.objects.get(username=email)
            otp = OTP.objects.filter(user=user, code=code, is_used=False).latest('created_at')
            
            if otp.is_expired():
                raise ValueError("This verification code has expired.")
            
            otp.is_used = True
            otp.save()
            
            user.is_active = True
            user.save()
            return True
        except (User.DoesNotExist, OTP.DoesNotExist):
            raise ValueError("The verification code is invalid.")

    @staticmethod
    def _activate_user(email):
        User.objects.filter(username=email).update(is_active=True)
        # Mark all OTPs for this user as used in DB
        user = User.objects.get(username=email)
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)

    @staticmethod
    def login_user(email, password):
        user = authenticate(username=email, password=password)
        if user is None:
            raise ValueError("Invalid email or password.")
        if not user.is_active:
            raise PermissionError("Your account is not verified. Please check your email.")
        return user
