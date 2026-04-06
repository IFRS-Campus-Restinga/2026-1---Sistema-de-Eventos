from rest_framework.views import APIView
from rest_framework.response import Response
#from api.models import Evento, Atracao, AvaliacaoSubmissao

def get_cor_area(area):
    cores = {
        "CIENCIAS_EXATAS_E_DA_TERRA": "bg-green-600",
        "CIENCIAS_HUMANAS": "bg-yellow-500",
        "LINGUISTICA_LETRAS_ARTES": "bg-blue-500"
    }
    return cores.get(area, "bg-gray-500")


class DashboardView(APIView):
    def get(self, request):

        user = request.user
        evento = Evento.objects.first()

        atracoes = Atracao.objects.filter(evento=evento)

        total = atracoes.count()

        avaliadas_ids = AvaliacaoSubmissao.objects.values_list('atracao_id', flat=True)

        sem_avaliador = atracoes.exclude(id__in=avaliadas_ids).count()

        desistencias = atracoes.filter(status="CANCELADO").count()

        areas = []
        areas_db = atracoes.values_list('area_conhecimento', flat=True).distinct()

        for area in areas_db:
            total_area = atracoes.filter(area_conhecimento=area).count()
            avaliados_area = atracoes.filter(
                area_conhecimento=area,
                id__in=avaliadas_ids
            ).count()

            areas.append({
                "nome": area,
                "avaliados": avaliados_area,
                "total": total_area,
                "cor": get_cor_area(area)
            })

        data = {
            "usuario": {
                "nome": user.username if user.is_authenticated else "Usuário",
                "iniciais": user.username[0].upper() if user.is_authenticated else "U"
            },
            "evento": {
                "nome": evento.nome if evento else "Evento"
            },
            "metricas": {
                "totalSubmissoes": total,
                "semAvaliador": sem_avaliador,
                "desistencias": desistencias,
                "taxaEvasao": int((desistencias / total) * 100) if total > 0 else 0
            },
            "areas": areas,
            "acoes": [
                "Homologar Avaliadores",
                "Editar Evento",
                "Definir Locais"
            ]
        }

        return Response(data)