from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_active']

class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
            queryset=User.objects.all(), 
            message="An account with this email address already exists."
        )],
        error_messages={
            'invalid': 'Please provide a valid email address.',
            'required': 'Email is required.'
        }
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        error_messages={'required': 'Password is required.'}
    )

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_email(self, value):
        return value.lower().strip()

class OtpVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(
        max_length=6, 
        min_length=6, 
        required=True,
        error_messages={
            'max_length': 'OTP must be exactly 6 digits.',
            'min_length': 'OTP must be exactly 6 digits.',
            'required': 'OTP code is required.'
        }
    )

    def validate_otp_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must only contain numbers.")
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={'required': 'Email is required.'})
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        error_messages={'required': 'Password is required.'}
    )