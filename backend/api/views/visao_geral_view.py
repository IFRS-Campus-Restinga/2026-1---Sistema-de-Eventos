from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..enumerations.status_atracao import StatusAtracao
from ..models.atracao import Atracao
from ..models.evento import Evento
from ..models.inscricao_evento import InscricaoEvento
from ..serializers.etapa_evento_serializer import EtapaEventoSerializer
from ..models.submissao import Submissao


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

        atracoes = Atracao.objects.filter(evento=evento).exclude(
            status=StatusAtracao.PREVISTA
        )
        submissoes = Submissao.objects.filter(evento=evento)
        total_atracoes = atracoes.count()
        total_submissoes = submissoes.count()
        desistencias = atracoes.filter(status=StatusAtracao.CANCELADA).count()
        sem_avaliador = atracoes.filter(status=StatusAtracao.PREVISTA).count()

        total_inscricoes = InscricaoEvento.objects.filter(evento=evento).count()

        areas = []
        for area in atracoes.values_list(
            "submissao__area_conhecimento", flat=True
        ).distinct():
            total_area = atracoes.filter(submissao__area_conhecimento=area).count()
            avaliados_area = (
                atracoes.filter(submissao__area_conhecimento=area)
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

        etapas = evento.etapas.all().order_by("data_inicio")
        etapa_inicio = etapas.first()
        etapa_fim = etapas.order_by("data_fim").last()

        data = {
            "usuario": {
                "nome": request.user.username
                if request.user.is_authenticated
                else "Usuário",
            },
            "evento": {
                "id": evento.id,
                "nome": evento.nome,
                "local": evento.local.nome,
                "status_evento": evento.status_evento,
                "inicio": etapa_inicio.data_inicio if etapa_inicio else None,
                "fim": etapa_fim.data_fim if etapa_fim else None,
                "etapas": EtapaEventoSerializer(etapas, many=True).data,
            },
            "metricas": {
                "total_atracoes": total_atracoes,
                "total_submissoes": total_submissoes,
                "total_inscricoes": total_inscricoes,
                "sem_avaliador": sem_avaliador,
                "desistencias": desistencias,
                "taxa_evasao": int((desistencias / total_atracoes) * 100)
                if total_atracoes > 0
                else 0,
            },
            "areas": areas,
        }

        return Response(data, status=status.HTTP_200_OK)
