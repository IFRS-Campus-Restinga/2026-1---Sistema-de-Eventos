from rest_framework import serializers
from django.contrib.auth.models import Permission

class PermissaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name']