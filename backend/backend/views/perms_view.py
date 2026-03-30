from rest_framework import generics
from django.contrib.auth.models import Permission
from api.serializers import PermissaoSerializer

class PermissaoListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissaoSerializer