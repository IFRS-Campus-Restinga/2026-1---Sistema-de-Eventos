from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from guardian.shortcuts import assign_perm, get_users_with_perms, remove_perm
from ..serializers.evento_serializer import EventoSerializer
from ..models.evento import Evento
from django.contrib.auth.models import Group

# from api.permissions import IsAdmin, PodeGerenciarEvento
from .perms_generic_view import PodeCoordenarEvento, PodeGerenciarEquipeEvento


def _serializar_usuarios(usuarios):
    return [
        {
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
        }
        for usuario in usuarios
    ]


User = get_user_model()


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
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)

            self.check_object_permissions(request, evento)

            serializer = EventoSerializer(evento)
            return Response(serializer.data)

        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)


class EventoUpdateView(APIView):
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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

# isso daq serve pra converter os objs vindo do banco em json. serve mais pra transformar msm.


def _serializar_usuarios(usuarios):
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        for user in usuarios
    ]


class EventoCoordenadorView(APIView):
    permission_classes = [PodeGerenciarEquipeEvento]

    coordenador_perm = "api.coordenar_evento"

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        coordenadores = get_users_with_perms(
            evento,
            only_with_perms_in=["coordenar_evento"],
            with_group_users=False,
        )

        return Response(
            {
                "evento_id": evento.id,
                "coordenadores": _serializar_usuarios(coordenadores),
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):

        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"erro": "Campo user_id é obrigatório"}, status=400)

        try:
            novo_coordenador = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=404)

        # daria pra usar o get_or_create né, mas meio q a gnt tem coordenador,
        #  enfim, ta td certo. Se veio pra reclamar, faz melhor. -Breno

        # moral disso daq é dar grupo pro coordenador no momento que ele for atribuido a permissão. -Breno
        grupo_coordenador= Group.objects.get(name="Coordenador")
        novo_coordenador.groups.add(grupo_coordenador)

        # Regra simples: manter apenas um coordenador por evento.
        atuais = get_users_with_perms(
            evento,
            only_with_perms_in=["coordenar_evento"],
            with_group_users=False,
        )
        for user in atuais:
            remove_perm(self.coordenador_perm, user, evento)

        assign_perm(self.coordenador_perm, novo_coordenador, evento)

        return Response(
            {
                "msg": "Coordenador definido com sucesso",
                "evento_id": evento.id,
                "coordenador": {
                    "id": novo_coordenador.id,
                    "username": novo_coordenador.username,
                },
                "coordenadores": _serializar_usuarios(
                    get_users_with_perms(
                        evento,
                        only_with_perms_in=["coordenar_evento"],
                        with_group_users=False,
                    )
                ),
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):

        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"erro": "Campo user_id é obrigatório"}, status=400)

        try:
            coordenador_removido = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=404)

        remove_perm(self.coordenador_perm, coordenador_removido, evento)

        coordenadores = get_users_with_perms(
            evento,
            only_with_perms_in=["coordenar_evento"],
            with_group_users=False,
        )

        return Response(
            {
                "msg": "Coordenador removido com sucesso",
                "evento_id": evento.id,
                "coordenador_removido": {
                    "id": coordenador_removido.id,
                    "username": coordenador_removido.username,
                },
                "coordenadores": _serializar_usuarios(coordenadores),
            },
            status=status.HTTP_200_OK,
        )


class EventoOrganizadorView(APIView):
    permission_classes = [PodeGerenciarEquipeEvento]

    organizador_perm = "api.organiza_evento"

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        organizadores = get_users_with_perms(
            evento,
            only_with_perms_in=["organiza_evento"],
            with_group_users=False,
        )

        return Response(
            {
                "evento_id": evento.id,
                "organizadores": _serializar_usuarios(organizadores),
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"erro": "Campo user_id é obrigatório"}, status=400)

        try:
            novo_organizador = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=404)

        assign_perm(self.organizador_perm, novo_organizador, evento)

        organizadores = get_users_with_perms(
            evento,
            only_with_perms_in=["organiza_evento"],
            with_group_users=False,
        )

        return Response(
            {
                "msg": "Organizador definido com sucesso",
                "evento_id": evento.id,
                "organizador_adicionado": {
                    "id": novo_organizador.id,
                    "username": novo_organizador.username,
                },
                "organizadores": _serializar_usuarios(organizadores),
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"erro": "Campo user_id é obrigatório"}, status=400)

        try:
            organizador_removido = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=404)

        remove_perm(self.organizador_perm, organizador_removido, evento)

        organizadores = get_users_with_perms(
            evento,
            only_with_perms_in=["organiza_evento"],
            with_group_users=False,
        )

        return Response(
            {
                "msg": "Organizador removido com sucesso",
                "evento_id": evento.id,
                "organizador_removido": {
                    "id": organizador_removido.id,
                    "username": organizador_removido.username,
                },
                "organizadores": _serializar_usuarios(organizadores),
            },
            status=status.HTTP_200_OK,
        )
