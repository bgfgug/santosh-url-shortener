from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import UserProfile
import re

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    
    class Meta:
        model = UserProfile
        fields = ['avatar', 'address', 'email', 'bio', 'phone_number']

    def validate_bio(self, value):
        if value and len(value) > 255:
            raise serializers.ValidationError("Bio is too long. Please keep it under 255 characters.")
        return value

    def validate_phone_number(self, value):
        if value:
            # Basic numeric and special char check for phone numbers
            if not re.match(r'^[\d\s\-\+\(\)]+$', value):
                raise serializers.ValidationError("Invalid phone number format.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        email = user_data.get('email')
        
        if email:
            email = email.lower().strip()
            # Check if email is unique if it's being changed
            if User.objects.filter(email=email).exclude(pk=instance.user.pk).exists():
                raise serializers.ValidationError({"email": ["This email is already associated with another account."]})
            
            instance.user.email = email
            instance.user.username = email
            instance.user.save()
            
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.address = validated_data.get('address', instance.address)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, error_messages={'required': 'Current password is required.'})
    new_password = serializers.CharField(required=True, error_messages={'required': 'New password is required.'})

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value