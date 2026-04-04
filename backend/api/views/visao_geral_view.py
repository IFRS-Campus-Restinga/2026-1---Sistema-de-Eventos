from django.http import JsonResponse
from django.views import View
from .models import Evento, Atracao, AvaliacaoSubmissao, Usuario

class DashboardView(View):
    def get(self, request):

        # 👤 Usuário
        user = request.user if request.user.is_authenticated else Usuario.objects.first()

        # 🎉 Evento atual
        evento = Evento.objects.first()

        # 📄 Submissões (Atracoes do evento)
        atracoes = Atracao.objects.filter(evento=evento)

        total_submissoes = atracoes.count()

        # ❌ Sem avaliador
        avaliadas_ids = AvaliacaoSubmissao.objects.values_list('atracao_id', flat=True)
        sem_avaliador = atracoes.exclude(id__in=avaliadas_ids).count()

        # 🚪 Desistências (ajuste conforme seu model)
        desistencias = atracoes.filter(status="CANCELADO").count()

        # 📊 Áreas
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

        # 📦 Resposta final
        data = {
            "usuario": {
                "nome": user.nome if hasattr(user, 'nome') else user.username,
                "iniciais": (user.nome[0] if hasattr(user, 'nome') else user.username[0]).upper()
            },
            "evento": {
                "nome": evento.nome
            },
            "metricas": {
                "totalSubmissoes": total_submissoes,
                "crescimento": 0,
                "semAvaliador": sem_avaliador,
                "desistencias": desistencias,
                "taxaEvasao": int((desistencias / total_submissoes) * 100) if total_submissoes > 0 else 0
            },
            "areas": areas,
            "acoes": [
                "Homologar e Definir Avaliadores",
                "Editar Informações do Evento",
                "Definir Locais",
                "Enviar Emails",
                "Emitir Certificados",
                "Gerenciar Grupos",
                "Adicionar Novo Evento"
            ]
        }

        return JsonResponse(data)