from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.campo_formulario import CampoFormulario
from ..serializers import CampoFormularioSerializer


class CampoFormularioListView(APIView):
    queryset = CampoFormulario.objects.all()
    serializer_class = CampoFormularioSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        campos = CampoFormulario.objects.all()
        serializer = CampoFormularioSerializer(campos, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = CampoFormularioSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CampoFormularioDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return CampoFormulario.objects.get(pk=pk)
        except CampoFormulario.DoesNotExist:
            return None

    def get(self, request, pk):
        campo = self.get_object(pk)
        if not campo:
            return Response({"erro": "CampoFormulario não encontrado"}, status=404)

        serializer = CampoFormularioSerializer(campo)
        return Response(serializer.data)

    def put(self, request, pk):
        campo = self.get_object(pk)
        if not campo:
            return Response({"erro": "CampoFormulario não encontrado"}, status=404)

        serializer = CampoFormularioSerializer(campo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        campo = self.get_object(pk)
        if not campo:
            return Response({"erro": "CampoFormulario não encontrado"}, status=404)

        campo.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
