from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.tipo_etapa import TipoEtapa
from ..models.avaliacao_submissao import AvaliacaoSubmissao
from ..models.etapa_evento import EtapaEvento
from ..models.item_avaliacao_submissao import ItemAvaliacaoSubmissao
from ..serializers.item_avaliacao_submissao_serializer import (
    ItemAvaliacaoSubmissaoSerializer,
)


class ItemAvaliacaoSubmissaoListView(APIView):
    queryset = ItemAvaliacaoSubmissao.objects.all()
    serializer_class = ItemAvaliacaoSubmissaoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return ItemAvaliacaoSubmissaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        items = ItemAvaliacaoSubmissao.objects.all()
        avaliacao_id = request.query_params.get("avaliacao_submissao")
        if avaliacao_id:
            items = items.filter(avaliacao_submissao_id=avaliacao_id)
        serializer = ItemAvaliacaoSubmissaoSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        # Exige usuário autenticado
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        avaliacao_id = dados.get("avaliacao_submissao")
        if not avaliacao_id:
            return Response(
                {"erro": "Campo avaliacao_submissao é obrigatório"}, status=400
            )

        try:
            avaliacao = AvaliacaoSubmissao.objects.get(pk=avaliacao_id)
        except AvaliacaoSubmissao.DoesNotExist:
            return Response({"erro": "AvaliacaoSubmissao não encontrada"}, status=404)

        # Checar permissão do Guardian: se o usuário pode avaliar a submissão vinculada
        if not request.user.has_perm("api.avaliar_submissao", avaliacao.submissao):
            return Response(
                {"erro": "Usuário não tem permissão para avaliar esta submissão"},
                status=403,
            )

        # Verificar se a etapa de avaliação prévia do evento está aberta
        agora = timezone.now()
        evento = getattr(avaliacao.submissao, "evento", None)
        etapa_avaliacao = EtapaEvento.objects.filter(
            evento=evento,
            tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_avaliacao:
            return Response(
                {"erro": "Período de avaliação de submissões não está aberto"},
                status=400,
            )

        serializer = ItemAvaliacaoSubmissaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemAvaliacaoSubmissaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return ItemAvaliacaoSubmissao.objects.get(pk=pk)
        except ItemAvaliacaoSubmissao.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliacaoSubmissao não encontrado"},
                status=404,
            )

        serializer = ItemAvaliacaoSubmissaoSerializer(item)
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliacaoSubmissao não encontrado"},
                status=404,
            )

        # Exige usuário autenticado
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        avaliacao = item.avaliacao_submissao
        if not request.user.has_perm("api.avaliar_submissao", avaliacao.submissao):
            return Response(
                {"erro": "Usuário não tem permissão para avaliar esta submissão"},
                status=403,
            )

        # Verificar se a etapa de avaliação prévia do evento está aberta
        agora = timezone.now()
        evento = getattr(avaliacao.submissao, "evento", None)
        etapa_avaliacao = EtapaEvento.objects.filter(
            evento=evento,
            tipo_etapa=TipoEtapa.AVALIACAO_PREVIA,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_avaliacao:
            return Response(
                {"erro": "Período de avaliação de submissões não está aberto"},
                status=400,
            )

        serializer = ItemAvaliacaoSubmissaoSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliacaoSubmissao não encontrado"},
                status=404,
            )

        # Opcional: Adicionar checagem de permissão/etapa aqui se quiser blindar o DELETE
        item.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
