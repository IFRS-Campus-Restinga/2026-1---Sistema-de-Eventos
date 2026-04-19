from rest_framework import status

# from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .perms_generic_view import IsAdmin
from rest_framework.permissions import AllowAny #provisório, apenas para eu conseguir mapear no form de evento

from ..models.local import Local
from ..serializers import LocalSerializer


class LocalListView(APIView):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer
    #permission_classes = [IsAdmin]  # modificado
    permission_classes = [AllowAny] #provisório

    def get(self, request, *args, **kwargs):
        locals = Local.objects.all()
        serializer = LocalSerializer(locals, many=True)
        return Response(serializer.data)

    def post(self, request):
        dados = request.data
        serializer = LocalSerializer(data=dados)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocalDetailView(APIView):
    # nível de objetos: local específico
    permission_classes = [IsAdmin]  # modificado

    def get_object(self, pk):
        # função "básica" para pegar o local específico, caso exista. Se não existir, retorna None
        try:
            return Local.objects.get(pk=pk)
        except Local.DoesNotExist:
            return None

    def get(self, request, pk):
        local = self.get_object(pk)
        if not local:
            return Response({"erro": "Local não encontrado"}, status=404)

        self.check_object_permissions(request, local)

        serializer = LocalSerializer(local)
        return Response(serializer.data)

    def put(self, request, pk):
        local = self.get_object(pk)
        if not local:
            return Response({"erro": "Local não encontrado"}, status=404)

        self.check_object_permissions(request, local)

        serializer = LocalSerializer(local, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        local = self.get_object(pk)
        if not local:
            return Response({"erro": "Local não encontrado"}, status=404)

        self.check_object_permissions(request, local)

        local.delete()
        return Response({"msg": "Deletado com sucesso"}, status=204)
