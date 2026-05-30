from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.tipo_etapa import TipoEtapa
from ..models.avaliacao_atracao import AvaliacaoAtracao
from ..models.etapa_evento import EtapaEvento
from ..models.item_avaliacao_atracao import ItemAvaliaçãoAtracao
from ..serializers import ItemAvaliaçãoAtracaoSerializer


class ItemAvaliaçãoAtracaoListView(APIView):
    queryset = ItemAvaliaçãoAtracao.objects.all()
    serializer_class = ItemAvaliaçãoAtracaoSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        return ItemAvaliaçãoAtracaoSerializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        items = ItemAvaliaçãoAtracao.objects.all()
        avaliacao_id = request.query_params.get("avaliacao_atracao")
        if avaliacao_id:
            items = items.filter(avaliacao_atracao_id=avaliacao_id)
        serializer = ItemAvaliaçãoAtracaoSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        # exige usuário autenticado
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        avaliacao_id = dados.get("avaliacao_atracao")
        if not avaliacao_id:
            return Response(
                {"erro": "Campo avaliacao_atracao é obrigatório"}, status=400
            )

        try:
            avaliacao = AvaliacaoAtracao.objects.get(pk=avaliacao_id)
        except AvaliacaoAtracao.DoesNotExist:
            return Response({"erro": "AvaliacaoAtracao não encontrada"}, status=404)

        # checar permissão do usuário para avaliar a atração
        if not request.user.has_perm("api.avaliar_atracao", avaliacao.atracao):
            return Response(
                {"erro": "Usuário não tem permissão para avaliar esta atração"},
                status=403,
            )

        # verificar se a etapa de realização do evento está aberta
        agora = timezone.now()
        etapa_realizacao = EtapaEvento.objects.filter(
            evento=avaliacao.atracao.evento,
            tipo_etapa=TipoEtapa.REALIZACAO_EVENTO,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_realizacao:
            return Response(
                {"erro": "Período de realização do evento não está aberto"}, status=400
            )

        serializer = ItemAvaliaçãoAtracaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemAvaliaçãoAtracaoDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return ItemAvaliaçãoAtracao.objects.get(pk=pk)
        except ItemAvaliaçãoAtracao.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliaçãoAtracao não encontrado"},
                status=404,
            )

        serializer = ItemAvaliaçãoAtracaoSerializer(item)
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliaçãoAtracao não encontrado"},
                status=404,
            )

        # exige usuário autenticado
        if not request.user or not request.user.is_authenticated:
            return Response({"erro": "Autenticação requerida"}, status=401)

        avaliacao = item.avaliacao_atracao
        if not request.user.has_perm("api.avaliar_atracao", avaliacao.atracao):
            return Response(
                {"erro": "Usuário não tem permissão para avaliar esta atração"},
                status=403,
            )

        # verificar se a etapa de realização do evento está aberta
        agora = timezone.now()
        etapa_realizacao = EtapaEvento.objects.filter(
            evento=avaliacao.atracao.evento,
            tipo_etapa=TipoEtapa.REALIZACAO_EVENTO,
            data_inicio__lte=agora,
            data_fim__gte=agora,
        ).first()

        if not etapa_realizacao:
            return Response(
                {"erro": "Período de realização do evento não está aberto"}, status=400
            )

        serializer = ItemAvaliaçãoAtracaoSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"erro": "ItemAvaliaçãoAtracao não encontrado"},
                status=404,
            )

        item.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
