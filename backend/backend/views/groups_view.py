from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import Group
from api.serializers import GrupoSerializer


class GrupoListView(generics.ListAPIView):
    queryset = Group.objects.all()
    serializer_class = GrupoSerializer
    permission_classes = [AllowAny]
