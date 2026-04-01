from rest_framework import serializers
from django.contrib.auth.models import User

from .groups_serializer import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "user"]


class UserGrupoSerializer(serializers.ModelSerializer):
    groups = GrupoSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "groups"]


class UserGrupoUpdateSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), many=True, write_only=True, required=False
    )
    groups = GrupoSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "user", "group_id", "groups"]

    def update(self, instance, validated_data):
        print(instance)
        print(validated_data)
        group_id = validated_data.pop("group_id", None)

        if group_id is not None:
            instance.groups.set(group_id)

        return super().update(instance, validated_data)
