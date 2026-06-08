from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers.submissao_serializer import SubmissaoSerializer
from ..models.submissao import Submissao


class SubmissaoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        evento_id = request.query_params.get("evento")

        submissoes = Submissao.objects.all()

        if evento_id:
            submissoes = submissoes.filter(evento_id=evento_id)

        submissoes = submissoes.exclude(status_submissao="CONVERTIDA_EM_ATRACAO")

        serializer = SubmissaoSerializer(submissoes, many=True, context={"request": request})
        return Response(serializer.data)
