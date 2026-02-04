
import random
import string

def generate_otp_code(length=6):
    """Generate a random 6-digit numeric OTP code."""
    return ''.join(random.choices(string.digits, k=length))
