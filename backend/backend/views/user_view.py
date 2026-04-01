from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from api.serializers.users_serializer import *


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = GrupoSerializer
    permission_classes = [AllowAny]


class UserGruposView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.prefetch_related("groups")
    serializer_class = UserGrupoUpdateSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserGrupoUpdateSerializer
        return UserGrupoSerializer