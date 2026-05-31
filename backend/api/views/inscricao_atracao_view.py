from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.inscricao_atracao import InscricaoAtracao
from ..models.perfil import Perfil
from ..serializers.inscricao_atracao_serializer import InscricaoAtracaoSerializer


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

        serializer = InscricaoAtracaoSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
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

        inscricao.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
