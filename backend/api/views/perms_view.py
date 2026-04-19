from rest_framework import generics
from django.contrib.auth.models import Permission
from api.serializers import PermissaoSerializer

# from rest_framework.permissions import AllowAny
from .perms_generic_view import IsAdmin


class PermissaoListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissaoSerializer
    permission_classes = [IsAdmin]
