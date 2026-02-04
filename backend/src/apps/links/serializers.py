from rest_framework import serializers
from .models import ShortLink
import re
from urllib.parse import urlparse

class ShortLinkSerializer(serializers.ModelSerializer):
    short_url = serializers.SerializerMethodField()

    class Meta:
        model = ShortLink
        fields = ['id', 'original_url', 'short_code', 'short_url', 'click_count', 'expires_at', 'created_at']
        read_only_fields = ['click_count', 'created_at']
        extra_kwargs = {
            'original_url': {
                'error_messages': {
                    'invalid': 'Please enter a valid URL (e.g., https://google.com).',
                    'required': 'Target URL is required.'
                }
            }
        }

    def get_short_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f"/r/{obj.short_code}/")
        return f"/r/{obj.short_code}/"

    def validate_original_url(self, value):
        parsed = urlparse(value)
        if not parsed.scheme or not parsed.netloc:
            raise serializers.ValidationError("Please enter a complete URL including http:// or https://")
        
        # Prevent shortening internal links or localhost in production (optional, but good practice)
        forbidden_hosts = ['localhost', '127.0.0.1', '0.0.0.0']
        if parsed.netloc.split(':')[0] in forbidden_hosts:
            raise serializers.ValidationError("Cannot shorten links to internal or local addresses.")
            
        return value

    def validate_short_code(self, value):
        """
        Validate the user-submitted custom alias.
        - Must be alphanumeric, hyphens, or underscores.
        - Minimum length of 3 to prevent very short collisions.
        - Must be globally unique.
        """
        if value:
            value = value.strip().lower()
            
            if len(value) < 3:
                raise serializers.ValidationError("Custom alias must be at least 3 characters long.")
            
            if not re.match(r'^[\w-]+$', value):
                raise serializers.ValidationError(
                    "Aliases can only contain letters, numbers, hyphens (-), and underscores (_)."
                )
            
            # Uniqueness check
            queryset = ShortLink.objects.filter(short_code=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError("This custom alias is already taken. Please try another one.")
                
        return value