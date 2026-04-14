from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from guardian.shortcuts import assign_perm, get_users_with_perms, remove_perm
from ..serializers.evento_serializer import EventoSerializer
from ..models.evento import Evento
from api.permissions import IsAdmin, PodeGerenciarEvento


class EventoListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        eventos = Evento.objects.filter(ativo=True)
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EventoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventoDetailView(APIView):
    permission_classes = [PodeGerenciarEvento]

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)

            self.check_object_permissions(request, evento)

            serializer = EventoSerializer(evento)
            return Response(serializer.data)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)


class EventoUpdateView(APIView):
    permission_classes = [PodeGerenciarEvento]

    def put(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)

            serializer = EventoSerializer(evento, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=400)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)


class EventoDeleteView(APIView):
    permission_classes = [PodeGerenciarEvento]

    def delete(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)

            evento.ativo = False
            evento.save()

            return Response({"msg": "Evento desativado com sucesso"}, status=200)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)


# isso daq serve pra atribuir um coordenador ao evento, a rigor ele mata o grupo evento


class EventoCoordenadorView(APIView):
    permission_classes = [IsAdmin, PodeGerenciarEvento]

    def patch(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"erro": "Campo user_id é obrigatório"}, status=400)

        try:
            novo_coordenador = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=404)

        # Regra simples: manter apenas um coordenador por evento.
        atuais = get_users_with_perms(
            evento,
            only_with_perms_in=["coordenar_evento"],
            with_group_users=False,
        )
        for user in atuais:
            remove_perm("api.coordenar_evento", user, evento)

        assign_perm("api.coordenar_evento", novo_coordenador, evento)

        return Response(
            {
                "msg": "Coordenador definido com sucesso",
                "evento_id": evento.id,
                "coordenador": {
                    "id": novo_coordenador.id,
                    "username": novo_coordenador.username,
                },
            },
            status=status.HTTP_200_OK,
        )
