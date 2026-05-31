from django.db.models import RestrictedError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.sessao import Sessao
from ..serializers import SessaoSerializer
from .perms_generic_view import IsAdmin


class SessaoListView(APIView):
    queryset = Sessao.objects.all()
    serializer_class = SessaoSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAdmin()]

    def get(self, request, *args, **kwargs):
        # Filtros
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
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAdmin()]

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
        # caso seja necessário futuramente. Hoje não é usada a deleção de sessão 22/05/2026
        # deleção lógica
        sessao = self.get_object(pk)
        if not sessao:
            return Response({"erro": "Sessão não encontrada"}, status=404)

        self.check_object_permissions(request, sessao)

        try:
            if sessao.atracoes.exists():
                return Response(
                    {
                        "erro": "Não é possível excluir uma sessão com outras atrações vinculadas."
                    },
                    status=400,
                )
            sessao.ativo = False
            sessao.save()
            return Response({"message": "Removido com sucesso"}, status=200)
        except RestrictedError:
            return Response(
                {
                    "erro": "Não é possível excluir esta sessão pois existem registros vinculados."
                },
                status=400,
            )
