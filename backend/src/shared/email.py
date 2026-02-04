
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp_code):
    subject = "Your Verification Code"
    message = f"Your OTP for account verification is: {otp_code}. It will expire in 10 minutes."
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    send_mail(subject, message, email_from, recipient_list)
