from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.inscricao_atracao import InscricaoAtracao
from ..models.perfil import Perfil
from ..models.atracao import Atracao
from ..serializers.inscricao_atracao_serializer import InscricaoAtracaoSerializer

from django.db import transaction
from django.db.models import F
# F usado para não ocorrer condição de corrida (n entedeu? pesquisa, magrão)


# subtrair vagas da atração se tiver, fé
class InscricaoAtracaoListView(APIView):
    queryset = InscricaoAtracao.objects.all()
    serializer_class = InscricaoAtracaoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return InscricaoAtracaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        inscricoes = InscricaoAtracao.objects.all()
        serializer = InscricaoAtracaoSerializer(inscricoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"erro": "Não está logado."}, status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            perfil = Perfil.objects.get(usuario=request.user)
        except Perfil.DoesNotExist:
            return Response(
                {"erro": "Perfil não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        dados = request.data.copy()
        dados["perfil_id"] = perfil.id

        atracao_id = dados.get("atracao_id") or dados.get("atracao")
        if not atracao_id:
            return Response(
                {"erro": "ID da atração não fornecido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            atracao = Atracao.objects.get(pk=atracao_id)
        except Atracao.DoesNotExist:
            return Response(
                {"erro": "Atração não encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

        if atracao.submissao.sugestao_vagas <= 0:
            return Response(
                {"erro": "Esta atração não possui mais vagas disponíveis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = InscricaoAtracaoSerializer(data=dados)
        if serializer.is_valid():
            with transaction.atomic():
                submissao = atracao.submissao.__class__.objects.select_for_update().get(
                    pk=atracao.submissao.pk
                )
                if submissao.vagas_disponiveis <= 0:
                    return Response(
                        {"erro": "Esta atração não possui mais vagas disponíveis."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                serializer.save()

                submissao.vagas_disponiveis = F("vagas_disponiveis") - 1

                submissao.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MinhasInscricoesAtracaoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            perfil = Perfil.objects.get(usuario=request.user)
        except Perfil.DoesNotExist:
            return Response({"erro": "Perfil não encontrado"}, status=404)

        inscricoes_atracoes = InscricaoAtracao.objects.filter(perfil=perfil)
        serializer = InscricaoAtracaoSerializer(inscricoes_atracoes, many=True)
        return Response(serializer.data)


class InscricaoAtracaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return InscricaoAtracao.objects.get(pk=pk)
        except InscricaoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        inscricao = self.get_object(pk)
        if not inscricao:
            return Response({"erro": "Inscrição não encontrada"}, status=404)

        serializer = InscricaoAtracaoSerializer(inscricao)
        return Response(serializer.data)

    def put(self, request, pk):
        inscricao = self.get_object(pk)
        if not inscricao:
            return Response({"erro": "Inscrição não encontrada"}, status=404)
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            perfil = Perfil.objects.get(usuario=user)
        except Perfil.DoesNotExist:
            return Response(
                {"erro": "Perfil não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        if inscricao.perfil_id != perfil.id and not user.is_staff:
            return Response(
                {"detail": "Você não tem permissão para modificar esta inscrição."},
                status=status.HTTP_403_FORBIDDEN,
            )

        dados = request.data.copy()
        # Prevent changing ownership
        dados["perfil_id"] = inscricao.perfil_id

        serializer = InscricaoAtracaoSerializer(inscricao, data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        inscricao = self.get_object(pk)
        if not inscricao:
            return Response({"erro": "Inscrição não encontrada"}, status=404)
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            perfil = Perfil.objects.get(usuario=user)
        except Perfil.DoesNotExist:
            return Response(
                {"erro": "Perfil não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        if inscricao.perfil_id != perfil.id and not user.is_staff:
            return Response(
                {"detail": "Você não tem permissão para deletar esta inscrição."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            with transaction.atomic():
                submissao = inscricao.atracao.submissao.__class__.objects.select_for_update().get(
                    pk=inscricao.atracao.submissao.pk
                )

                submissao.vagas_disponiveis = F("vagas_disponiveis") + 1
                submissao.save()

                inscricao.delete()

            return Response({"msg": "Deletado com sucesso"}, status=204)
        except Exception as e:
            return Response(
                {"erro": f"Erro ao cancelar inscrição: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
