from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from .perms_serializer import PermissaoSerializer

User = get_user_model()


class GrupoSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "users"]

    def get_users(self, obj):
        from .users_serializer import UserSerializer

        return UserSerializer(obj.user_set.all(), many=True).data


class GrupoPermissoesSerializer(serializers.ModelSerializer):
    permissions = PermissaoSerializer(many=True, read_only=True)
    users = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "permissions", "users"]

    def get_users(self, obj):
        from .users_serializer import UserSerializer

        return UserSerializer(obj.user_set.all(), many=True).data


class GrupoPermissoesUpdateSerializer(serializers.ModelSerializer):
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), many=True, write_only=True, required=False
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, write_only=True, required=False
    )
    permissions = PermissaoSerializer(many=True, read_only=True)
    users = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "permission_id", "permissions", "user_id", "users"]

    def get_users(self, obj):
        from .users_serializer import UserSerializer

        return UserSerializer(obj.user_set.all(), many=True).data

    def update(self, instance, validated_data):
        permission_id = validated_data.pop("permission_id", None)
        user_id = validated_data.pop("user_id", None)

        if permission_id is not None:
            instance.permissions.set(permission_id)

        if user_id is not None:
            instance.user_set.set(user_id)

        return super().update(instance, validated_data)
