import os
import django


GROUP_NAMES = [
    "Administrador",
    "Coordenador",
    "Organizador",
    "Convidado",
    "Aluno",
    "Servidor",
]

LOCAIS_DATA = [
    {"nome": "Campus Restinga", "endereco": "Rua Alberto Hoffmann, 285"},
    {"nome": "Campus Centro", "endereco": "Avenida Principal, 1000"},
]

ESPACOS_DATA = [
    {
        "nome": "Auditório Principal",
        "capacidade": 120,
        "predio_bloco": "Bloco A",
        "recursos_disponiveis": "Projetor, som e microfone",
        "ativo": True,
        "local_nome": "Campus Restinga",
    },
    {
        "nome": "Laboratório de Informática",
        "capacidade": 30,
        "predio_bloco": "Bloco B",
        "recursos_disponiveis": "Computadores e internet",
        "ativo": True,
        "local_nome": "Campus Restinga",
    },
    {
        "nome": "Sala Multiuso",
        "capacidade": 60,
        "predio_bloco": "Bloco C",
        "recursos_disponiveis": "Projetor e ar-condicionado",
        "ativo": True,
        "local_nome": "Campus Centro",
    },
]

MODALIDADES_DATA = [
    {
        "nome": "Palestra",
        "requer_avaliacao": False,
        "requer_avaliacao_submissao": False,
        "emite_certificado": True,
        "limite_avaliadores": 0,
        "ativo": True,
    },
    {
        "nome": "Oficina",
        "requer_avaliacao": True,
        "requer_avaliacao_submissao": True,
        "emite_certificado": True,
        "limite_avaliadores": 2,
        "ativo": True,
    },
    {
        "nome": "Pôster",
        "requer_avaliacao": True,
        "requer_avaliacao_submissao": True,
        "emite_certificado": True,
        "limite_avaliadores": 2,
        "ativo": True,
    },
    {
        "nome": "Mesa-redonda",
        "requer_avaliacao": False,
        "requer_avaliacao_submissao": False,
        "emite_certificado": True,
        "limite_avaliadores": 0,
        "ativo": True,
    },
]

EVENTOS_DATA = [
    {
        "nome": "Semana Acadêmica de Tecnologia",
        "descricao": "Evento voltado para integração acadêmica com foco em inovação, pesquisa aplicada e formação técnica.",
        "status_evento": "EM_ANDAMENTO",
        "carga_horaria": 20,
        "setor": "ENSINO",
        "tema": "Inovação e Tecnologia",
        "modalidades_nomes": ["Palestra", "Oficina", "Pôster"],
        "local_nome": "Campus Restinga",
        "areas_conhecimento": [
            "CIENCIAS_EXATAS_E_DA_TERRA",
            "ENGENHARIAS",
        ],
    },
    {
        "nome": "Mostra de Extensão",
        "descricao": "Apresentação de projetos, relatos e soluções desenvolvidas junto à comunidade.",
        "status_evento": "INSCRICOES_ABERTAS",
        "carga_horaria": 12,
        "setor": "EXTENSAO",
        "tema": "Integração",
        "modalidades_nomes": ["Palestra", "Mesa-redonda"],
        "local_nome": "Campus Restinga",
        "areas_conhecimento": ["CIENCIAS_HUMANAS", "CIENCIAS_SOCIAIS_APLICADAS"],
    },
    {
        "nome": "Jornada de Pesquisa e Inovação",
        "descricao": "Espaço para apresentação de trabalhos científicos e avanços tecnológicos dos estudantes.",
        "status_evento": "EM_ANDAMENTO",
        "carga_horaria": 16,
        "setor": "PESQUISA",
        "tema": "Ciência, dados e inovação",
        "modalidades_nomes": ["Palestra", "Oficina", "Pôster"],
        "local_nome": "Campus Centro",
        "areas_conhecimento": [
            "CIENCIAS_EXATAS_E_DA_TERRA",
            "CIENCIAS_BIOLOGICAS",
            "ENGENHARIAS",
        ],
    },
]

ARQUIVOS_DATA = [
    {
        "nome_arquivo": "Edital da Mostra Científica",
        "evento_nome": "Mostra de Extensão",
        "caminho_fake": "editais/mostra_2025.pdf",
    },
    {
        "nome_arquivo": "Cronograma de Tecnologia",
        "evento_nome": "Semana Acadêmica de Tecnologia",
        "caminho_fake": "docs/cronograma.pdf",
    },
]

ETAPAS_DATA = [
    {
        "evento_nome": "Semana Acadêmica de Tecnologia",
        "tipo_etapa": "INSCRICAO_PUBLICO",
        "data_inicio": "2025-09-01 08:00:00",
        "data_fim": "2025-10-15 23:59:59",
    },
    {
        "evento_nome": "Semana Acadêmica de Tecnologia",
        "tipo_etapa": "REALIZACAO_EVENTO",
        "data_inicio": "2025-10-20 08:00:00",
        "data_fim": "2025-10-22 18:00:00",
    },
    {
        "evento_nome": "Mostra de Extensão",
        "tipo_etapa": "INSCRICAO_PUBLICO",
        "data_inicio": "2025-08-10 00:00:00",
        "data_fim": "2025-09-10 23:59:59",
    },
]

# Atualize esta lista no seu arquivo de seed
AREAS_DATA = [
    {
        "area": "CIENCIAS_EXATAS_E_DA_TERRA", 
        "descricao": "Ciências que estudam a matéria, as leis da natureza e fenômenos matemáticos."
    },
    {
        "area": "CIENCIAS_BIOLOGICAS", 
        "descricao": "Estudo dos organismos vivos, sua estrutura, funções, crescimento e evolução."
    },
    {
        "area": "ENGENHARIAS", 
        "descricao": "Aplicação de conhecimentos científicos e técnicos para a criação de soluções e infraestrutura."
    },
    {
        "area": "CIENCIAS_DA_SAUDE", 
        "descricao": "Conhecimentos voltados para a prevenção, diagnóstico e tratamento de doenças."
    },
    {
        "area": "CIENCIAS_AGRARIAS", 
        "descricao": "Estudo de práticas agrícolas, pecuária e exploração sustentável de recursos naturais."
    },
    {
        "area": "CIENCIAS_SOCIAIS_APLICADAS", 
        "descricao": "Estudo dos aspectos sociais do mundo humano e das relações jurídicas e econômicas."
    },
    {
        "area": "CIENCIAS_HUMANAS", 
        "descricao": "Investigação do comportamento, cultura, história e sociedade humana."
    },
    {
        "area": "LINGUISTICA_LETRAS_E_ARTES", 
        "descricao": "Estudo das linguagens, produção literária e manifestações artísticas e culturais."
    },
]

ATRACOES_DATA = [
    {
        "titulo": "Aplicações de IA no ensino técnico",
        "resumo": "Apresentação de um estudo sobre o uso de inteligência artificial em atividades didáticas e avaliação formativa no ensino técnico.",
        "palavras_chave": "IA, ensino, tecnologia educacional",
        "evento_nome": "Semana Acadêmica de Tecnologia",
        "modalidade_nome": "Pôster",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "CIENCIAS_EXATAS_E_DA_TERRA",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Robótica acessível para laboratórios escolares",
        "resumo": "Desenvolvimento de kits de baixo custo para ensino de robótica e automação em ambientes educacionais.",
        "palavras_chave": "robótica, educação, automação",
        "evento_nome": "Semana Acadêmica de Tecnologia",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "ENSINO_MEDIO_INTEGRADO",
        "area_conhecimento": "ENGENHARIAS",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Horta comunitária e segurança alimentar",
        "resumo": "Relato de experiência de uma ação extensionista com foco em alimentação saudável e sustentabilidade.",
        "palavras_chave": "extensão, comunidade, sustentabilidade",
        "evento_nome": "Mostra de Extensão",
        "modalidade_nome": "Palestra",
        "nivel_ensino": "SUBSEQUENTE",
        "area_conhecimento": "CIENCIAS_HUMANAS",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Tecnologias sociais para economia solidária",
        "resumo": "Apresentação de soluções sociais desenvolvidas em parceria com associações locais.",
        "palavras_chave": "tecnologia social, economia solidária, extensão",
        "evento_nome": "Mostra de Extensão",
        "modalidade_nome": "Mesa-redonda",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "CIENCIAS_SOCIAIS_APLICADAS",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Biodiversidade e compostos bioativos da mata nativa",
        "resumo": "Trabalho científico investigando potenciais aplicações farmacológicas de espécies vegetais da região sul.",
        "palavras_chave": "biodiversidade, biologia, bioativos",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Pôster",
        "nivel_ensino": "MESTRADO",
        "area_conhecimento": "CIENCIAS_BIOLOGICAS",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Monitoramento de dados para eficiência energética",
        "resumo": "Aplicação de análise de dados para reduzir consumo elétrico em espaços institucionais.",
        "palavras_chave": "dados, energia, eficiência",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "POS_GRADUACAO",
        "area_conhecimento": "ENGENHARIAS",
        "status": "CONFIRMADA",
    },
]


def setup_django():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()


def seed_groups():
    from django.contrib.auth.models import Group

    created = []
    existing = []

    for name in GROUP_NAMES:
        group, was_created = Group.objects.get_or_create(name=name)
        if was_created:
            created.append(group.name)
        else:
            existing.append(group.name)

    print("Seed de grupos finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


def seed_locais():
    from api.models.local import Local

    created = []
    existing = []

    for item in LOCAIS_DATA:
        local = Local.objects.filter(
            nome__iexact=item["nome"], endereco__iexact=item["endereco"]
        ).first()

        if local:
            existing.append(local.nome)
            continue

        local = Local(**item)
        local.full_clean()
        local.save()
        created.append(local.nome)

    print("Seed de locais finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


def seed_espacos():
    from api.models.espaco import Espaco
    from api.models.local import Local

    created = []
    existing = []

    for item in ESPACOS_DATA:
        local = Local.objects.filter(nome__iexact=item["local_nome"]).first()
        if not local:
            raise RuntimeError(
                f"Local base '{item['local_nome']}' nao encontrado. Rode seed_locais antes de seed_espacos."
            )

        espaco = Espaco.objects.filter(nome__iexact=item["nome"], local=local).first()

        if espaco:
            existing.append(f"{espaco.nome} ({espaco.local.nome})")
            continue

        espaco = Espaco(
            nome=item["nome"],
            capacidade=item["capacidade"],
            predio_bloco=item["predio_bloco"],
            recursos_disponiveis=item["recursos_disponiveis"],
            ativo=item["ativo"],
            local=local,
        )
        espaco.full_clean()
        espaco.save()
        created.append(f"{espaco.nome} ({espaco.local.nome})")

    print("Seed de espacos finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


def seed_modalidades():
    from api.models.modalidade import Modalidade

    created = []
    existing = []

    for item in MODALIDADES_DATA:
        modalidade = Modalidade.objects.filter(nome__iexact=item["nome"]).first()

        if modalidade:
            existing.append(modalidade.nome)
            continue

        modalidade = Modalidade(**item)
        modalidade.full_clean()
        modalidade.save()
        created.append(modalidade.nome)

    print("Seed de modalidades finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


def seed_areas():
    from api.models.area_conhecimento import AreaConhecimento

    created_count = 0
    for item in AREAS_DATA:
        area, created = AreaConhecimento.objects.get_or_create(
            area_conhecimento=item["area"], defaults={"descricao": item["descricao"]}
        )
        if created:
            created_count += 1
    print(f"Seed de áreas finalizada. Criadas: {created_count}")


def seed_eventos():
    from api.models.evento import Evento
    from api.models.modalidade import Modalidade
    from api.models.local import Local
    from api.models.area_conhecimento import AreaConhecimento

    for item in EVENTOS_DATA:
        local = Local.objects.filter(nome__iexact=item["local_nome"]).first()

        # Primeiro, tentamos buscar o evento exatamente pelo nome
        evento = Evento.objects.filter(nome__iexact=item["nome"]).first()
        created = False

        if not evento:
            # Se não existe, criamos um novo
            evento = Evento.objects.create(
                nome=item["nome"],
                descricao=item["descricao"],
                status_evento=item["status_evento"],
                carga_horaria=item["carga_horaria"],
                setor=item["setor"],
                tema=item["tema"],
                local=local,
            )
            created = True

        # Vincular N:N (Sempre rodar para garantir que os vínculos existam)
        mods = Modalidade.objects.filter(nome__in=item["modalidades_nomes"])
        evento.modalidades.set(mods)

        areas = AreaConhecimento.objects.filter(
            area_conhecimento__in=item["areas_conhecimento"]
        )
        evento.area_conhecimento.set(areas)

        status = "criado" if created else "já existia"
        print(f"Evento '{evento.nome}' {status} com {areas.count()} áreas.")


def seed_atracoes():
    from api.models.atracao import Atracao
    from api.models.evento import Evento
    from api.models.modalidade import Modalidade

    created = []
    existing = []

    for item in ATRACOES_DATA:
        evento = Evento.objects.filter(nome__iexact=item["evento_nome"]).first()
        if not evento:
            print(
                f"Aviso: Evento '{item['evento_nome']}' não encontrado. Pulando atração '{item['titulo']}'."
            )
            continue

        modalidade = Modalidade.objects.filter(
            nome__iexact=item["modalidade_nome"]
        ).first()
        if not modalidade:
            print(
                f"Aviso: Modalidade '{item['modalidade_nome']}' não encontrada. Pulando atração '{item['titulo']}'."
            )
            continue

        atracao = Atracao.objects.filter(
            titulo__iexact=item["titulo"], evento=evento
        ).first()
        if atracao:
            existing.append(atracao.titulo)
            continue

        atracao = Atracao(
            titulo=item["titulo"],
            resumo=item["resumo"],
            palavras_chave=item["palavras_chave"],
            modalidade=modalidade,
            nivel_ensino=item["nivel_ensino"],
            area_conhecimento=item["area_conhecimento"],
            evento=evento,
            status=item["status"],
            sou_orientador=False,
            acessibilidade=False,
        )
        atracao.full_clean()
        atracao.save()
        created.append(atracao.titulo)

    print("Seed de atracoes finalizada.")
    print(f"Criadas: {created if created else 'nenhuma'}")
    print(f"Ja existiam: {existing if existing else 'nenhuma'}")


def seed_etapas():
    from api.models.etapa_evento import EtapaEvento
    from api.models.evento import Evento
    from django.utils.dateparse import parse_datetime
    from django.utils import timezone

    created_count = 0
    existing_count = 0

    for item in ETAPAS_DATA:
        evento = Evento.objects.filter(nome__iexact=item["evento_nome"]).first()
        if not evento:
            print(
                f"Pulo: Evento '{item['evento_nome']}' não encontrado para etapa {item['tipo_etapa']}."
            )
            continue

        data_inicio = parse_datetime(item["data_inicio"])
        data_fim = parse_datetime(item["data_fim"])

        # Convert naive datetimes to timezone-aware
        if data_inicio and timezone.is_naive(data_inicio):
            data_inicio = timezone.make_aware(data_inicio)
        if data_fim and timezone.is_naive(data_fim):
            data_fim = timezone.make_aware(data_fim)

        etapa, created = EtapaEvento.objects.update_or_create(
            evento=evento,
            tipo_etapa=item["tipo_etapa"],
            defaults={
                "data_inicio": data_inicio,
                "data_fim": data_fim,
            },
        )

        if created:
            created_count += 1
        else:
            existing_count += 1

    print("Seed de etapas finalizada.")
    print(f"Criadas: {created_count} | Já existiam/Atualizadas: {existing_count}")


def seed_arquivos():
    from api.models.arquivo import Arquivo
    from api.models.evento import Evento

    created = []
    existing = []

    for item in ARQUIVOS_DATA:
        evento = Evento.objects.filter(nome__iexact=item["evento_nome"]).first()
        if not evento:
            print(
                f"Aviso: Evento '{item['evento_nome']}' não encontrado. Pulando arquivo."
            )
            continue

        arquivo_obj = Arquivo.objects.filter(
            nome_arquivo__iexact=item["nome_arquivo"], evento=evento
        ).first()

        if arquivo_obj:
            existing.append(item["nome_arquivo"])
            continue

        arquivo_obj = Arquivo(
            nome_arquivo=item["nome_arquivo"],
            evento=evento,
            arquivo=item["caminho_fake"],
        )
        arquivo_obj.save()
        created.append(item["nome_arquivo"])

    print("Seed de arquivos finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


def seed_admin_user():
    """Cria um superusuário padrão 'admin' com senha 'admin' e o adiciona ao grupo 'Administrador'."""
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import Group

    User = get_user_model()
    username = "admin"
    password = "admin"
    group_name = "Administrador"

    user = User.objects.filter(username=username).first()
    if user:
        print(f"Superusuário '{username}' já existe.")
    else:
        # email obrigatório pode variar; usar email genérico
        try:
            User.objects.create_superuser(
                username=username, email="admin@example.com", password=password
            )
            print(f"Superusuário '{username}' criado com sucesso.")
        except TypeError:
            # alguns projetos usam campos personalizados (ex.: sem email)
            user = User.objects.create_superuser(username=username, password=password)
            print(f"Superusuário '{username}' criado (compatibilidade sem email).")

    # garantir que o grupo exista e adicionar o usuário
    group, _ = Group.objects.get_or_create(name=group_name)
    user = User.objects.get(username=username)
    user.groups.add(group)
    user.save()
    print(f"Usuário '{username}' adicionado ao grupo '{group_name}'.")


if __name__ == "__main__":
    setup_django()
    seed_groups()
    seed_locais()
    seed_espacos()
    seed_modalidades()
    seed_areas()
    seed_eventos()
    seed_atracoes()
    seed_arquivos()
    seed_etapas()
    seed_admin_user()
