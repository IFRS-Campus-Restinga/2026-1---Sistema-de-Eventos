from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..enumerations.status_atracao import StatusAtracao
from ..models.evento import Evento
from ..models.atracao import Atracao


class DashboardView(APIView):
    # dshboard focada em um evento específico

    def get(self, request, pk):
        try:
            evento = Evento.objects.get(pk=pk)
        except Evento.DoesNotExist:
            return Response(
                {"erro": "Evento não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        atracoes = Atracao.objects.filter(evento=evento)
        total = atracoes.count()
        desistencias = atracoes.filter(status=StatusAtracao.CANCELADA).count()
        sem_avaliador = atracoes.filter(status=StatusAtracao.PREVISTA).count()

        areas = []
        for area in atracoes.values_list("area_conhecimento", flat=True).distinct():
            total_area = atracoes.filter(area_conhecimento=area).count()
            avaliados_area = (
                atracoes.filter(area_conhecimento=area)
                .exclude(status=StatusAtracao.PREVISTA)
                .count()
            )

            areas.append(
                {
                    "nome": area,
                    "avaliados": avaliados_area,
                    "total": total_area,
                }
            )

        data = {
            "usuario": {
                "nome": request.user.username
                if request.user.is_authenticated
                else "Usuário",
            },
            "evento": {
                "id": evento.id,
                "nome": evento.nome,
            },
            "metricas": {
                "totalSubmissoes": total,
                "semAvaliador": sem_avaliador,
                "desistencias": desistencias,
                "taxaEvasao": int((desistencias / total) * 100) if total > 0 else 0,
            },
            "areas": areas,
        }

        return Response(data, status=status.HTTP_200_OK)
