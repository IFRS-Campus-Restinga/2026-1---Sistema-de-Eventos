from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from guardian.shortcuts import (
    assign_perm,
    get_objects_for_user,
    get_users_with_perms,
    remove_perm,
)
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.atracao import Atracao
from ..models.submissao import Submissao
from ..models.evento import Evento
from ..models.perfil import Perfil
from ..serializers.evento_serializer import EventoSerializer
from .perms_generic_view import PodeGerenciarEquipeEvento

User = get_user_model()


def _serializar_usuarios(usuarios):
    """Auxiliar para serializar usuários acoplando dados do perfil interno."""
    serialized = []
    for user in usuarios:
        perfil = Perfil.objects.filter(usuario=user).first()
        perfil_id = perfil.id if perfil else None
        nome = None
        if perfil and getattr(perfil, "nome", None):
            nome = perfil.nome
        else:
            nome = getattr(user, "get_full_name", lambda: "")() or user.username
        serialized.append(
            {
                "id": user.id,
                "username": user.username,
                "perfil_id": perfil_id,
                "nome": nome,
                "email": user.email,
            }
        )
    return serialized


class EventoListView(APIView):
    permission_classes = [AllowAny]
    serializer_class = EventoSerializer

    def get_serializer(self, *args, **kwargs):
        return EventoSerializer(*args, **kwargs)

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


class MeusEventosAvaliadorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Busca eventos por permissão ou histórico em Atrações
        atracoes_com_perm = get_objects_for_user(
            user, "api.avaliar_atracao", klass=Atracao
        )
        eventos_vinculados_atracao = set(
            atracoes_com_perm.values_list("submissao__evento_id", flat=True)
        )
        eventos_por_avaliacao_atracao = set(
            Evento.objects.filter(
                submissoes__atracao__avaliacaoatracao__avaliador=user
            ).values_list("pk", flat=True)
        )
        pks_atracao = eventos_vinculados_atracao | eventos_por_avaliacao_atracao

        # 2. Busca eventos por permissão ou histórico em Submissões
        submissoes_com_perm = get_objects_for_user(
            user, "api.avaliar_submissao", klass=Submissao
        )
        eventos_vinculados_submissao = set(
            submissoes_com_perm.values_list("evento_id", flat=True)
        )
        eventos_por_avaliacao_submissao = set(
            Evento.objects.filter(submissoes__avaliacoes__avaliador=user).values_list(
                "pk", flat=True
            )
        )
        pks_submissao = eventos_vinculados_submissao | eventos_por_avaliacao_submissao

        # 3. Une todos os IDs válidos
        pks_totais = pks_atracao | pks_submissao

        queryset = Evento.objects.filter(pk__in=pks_totais, ativo=True).distinct()

        # 4. Serializa e injeta as travas de escopo dinamicamente
        dados_eventos = EventoSerializer(queryset, many=True).data

        for evento_data in dados_eventos:
            evt_id = evento_data["id"]
            evento_data["pode_avaliar_atracoes"] = evt_id in pks_atracao
            evento_data["pode_avaliar_submissoes"] = evt_id in pks_submissao

        return Response(dados_eventos, status=200)


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

        grupo_coordenador = Group.objects.get(name="Coordenador")
        novo_coordenador.groups.add(grupo_coordenador)
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

        grupo_coordenador = Group.objects.get(name="Coordenador")
        coordenador_removido.groups.remove(grupo_coordenador)
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

        grupo_organizador = Group.objects.get(name="Organizador")
        novo_organizador.groups.add(grupo_organizador)
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

        grupo_organizador = Group.objects.get(name="Organizador")
        organizador_removido.groups.remove(grupo_organizador)
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


class EventoAvaliadorView(APIView):
    permission_classes = [PodeGerenciarEquipeEvento]
    avaliador_perm = "api.avaliador_evento"

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        if not evento.modalidades.filter(requer_avaliacao=True).exists():
            return Response(
                {"erro": "Nenhuma modalidade do evento requer avaliação"}, status=400
            )

        avaliadores = get_users_with_perms(
            evento, only_with_perms_in=["avaliador_evento"], with_group_users=False
        )
        return Response(
            {"evento_id": evento.id, "avaliadores": _serializar_usuarios(avaliadores)},
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk, ativo=True)
            self.check_object_permissions(request, evento)
        except Evento.DoesNotExist:
            return Response({"erro": "Evento não encontrado"}, status=404)

        perfil_id = request.data.get("perfil_id")
        if not perfil_id:
            return Response({"erro": "Campo perfil_id é obrigatório"}, status=400)

        try:
            perfil = Perfil.objects.get(pk=perfil_id)
            novo_avaliador = perfil.usuario
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        if not evento.modalidades.filter(requer_avaliacao=True).exists():
            return Response(
                {"erro": "Nenhuma modalidade do evento requer avaliação"}, status=400
            )

        if not novo_avaliador.groups.filter(name="Servidor").exists():
            return Response(
                {"erro": "Usuário não pertence ao grupo Servidor"}, status=400
            )

        assign_perm(self.avaliador_perm, novo_avaliador, evento)
        return Response(
            {
                "msg": "Avaliador definido com sucesso",
                "evento_id": evento.id,
                "avaliador": {
                    "id": novo_avaliador.id,
                    "username": novo_avaliador.username,
                },
                "avaliadores": _serializar_usuarios(
                    get_users_with_perms(
                        evento,
                        only_with_perms_in=["avaliador_evento"],
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

        perfil_id = request.data.get("perfil_id")
        if not perfil_id:
            return Response({"erro": "Campo perfil_id é obrigatório"}, status=400)

        try:
            perfil = Perfil.objects.get(pk=perfil_id)
            avaliador_removido = perfil.usuario
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        remove_perm(self.avaliador_perm, avaliador_removido, evento)

        avaliadores = get_users_with_perms(
            evento, only_with_perms_in=["avaliador_evento"], with_group_users=False
        )
        return Response(
            {
                "msg": "Avaliador removido com sucesso",
                "evento_id": evento.id,
                "avaliador_removido": {
                    "id": avaliador_removido.id,
                    "username": avaliador_removido.username,
                },
                "avaliadores": _serializar_usuarios(avaliadores),
            },
            status=status.HTTP_200_OK,
        )
