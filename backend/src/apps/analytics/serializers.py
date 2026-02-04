
from rest_framework import serializers
from .models import LinkClick

class LinkClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkClick
        fields = ['id', 'timestamp', 'ip_address', 'user_agent', 'referrer']
