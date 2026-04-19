from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.sessao import Sessao
from ..serializers import SessaoSerializer
from .perms_generic_view import IsAdmin  # Seguindo seu padrão de permissões


class SessaoListView(APIView):
    queryset = Sessao.objects.all()
    serializer_class = SessaoSerializer
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        # Filtros opcionais via query params
        evento_id = request.query_params.get("evento")
        espaco_id = request.query_params.get("espaco")

        sessoes = Sessao.objects.all()

        if evento_id and evento_id.isdigit():
            sessoes = sessoes.filter(evento_id=int(evento_id))

        if espaco_id and espaco_id.isdigit():
            sessoes = sessoes.filter(espaco_id=int(espaco_id))

        serializer = SessaoSerializer(sessoes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SessaoSerializer(data=request.data)
        # O is_valid() vai disparar as validações de capacidade e horário do Model/Serializer
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SessaoDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_object(self, pk):
        try:
            return Sessao.objects.get(pk=pk)
        except Sessao.DoesNotExist:
            return None

    def get(self, request, pk):
        sessao = self.get_object(pk)
        if not sessao:
            return Response(
                {"erro": "Sessão não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = SessaoSerializer(sessao)
        return Response(serializer.data)

    def put(self, request, pk):
        sessao = self.get_object(pk)
        if not sessao:
            return Response({"erro": "Sessão não encontrada"}, status=404)

        # Se houver permissões de objeto específicas, adicione aqui
        # self.check_object_permissions(request, sessao)

        serializer = SessaoSerializer(sessao, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        sessao = self.get_object(pk)
        if not sessao:
            return Response({"erro": "Sessão não encontrada"}, status=404)

        # Se o seu modelo de Sessão tiver deleção lógica (campo 'ativo'),
        # siga o padrão do Espaço. Caso contrário, use o delete físico:
        sessao.delete()
        return Response(
            {"message": "Sessão removida com sucesso"}, status=status.HTTP_200_OK
        )
