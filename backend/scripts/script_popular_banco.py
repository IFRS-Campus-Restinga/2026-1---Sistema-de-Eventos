import os
import platform
import subprocess
import sys

import django
from django.utils.text import slugify

# Definição de caminhos apartir do S.O
diretorio_script = os.path.dirname(os.path.abspath(__file__))
raiz_projeto = os.path.dirname(diretorio_script)

# Verificação se está na Venv
rodando_na_venv = sys.prefix != sys.base_prefix

if not rodando_na_venv:
    print("[INFO] Interpretador global detectado. Procurando ambiente virtual...")

    sistema = platform.system()
    nomes_venv = ["venv", ".venv", "env"]
    venv_python = None

    # Itera sobre os possíveis nomes até encontrar um caminho válido
    for nome in nomes_venv:
        if sistema == "Windows":
            caminho_teste = os.path.join(raiz_projeto, nome, "Scripts", "python.exe")
        else:
            caminho_teste = os.path.join(raiz_projeto, nome, "bin", "python")

        if os.path.exists(caminho_teste):
            venv_python = caminho_teste
            break

    # Trava de segurança caso nenhum ambiente seja encontrado
    if not venv_python:
        print(
            f"[ERRO] Nenhum ambiente virtual ({', '.join(nomes_venv)}) encontrado em: {raiz_projeto}"
        )
        input("\nPressione Enter para sair...")
        sys.exit(1)

    try:
        # Re-executa o script usando o Python da venv localizada
        resultado = subprocess.run([venv_python] + sys.argv)
        sys.exit(resultado.returncode)
    except Exception as e:
        print(f"[ERRO] Falha ao iniciar o processo na venv: {e}")
        input("\nPressione Enter para sair...")
        sys.exit(1)

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
    {
        "nome": "Sala 401",
        "capacidade": 30,
        "predio_bloco": "Bloco B",
        "recursos_disponiveis": "Computadores e internet",
        "ativo": True,
        "local_nome": "Campus Restinga",
    },
    {
        "nome": "Sala 402",
        "capacidade": 20,
        "predio_bloco": "Bloco B",
        "recursos_disponiveis": "Computadores e internet",
        "ativo": True,
        "local_nome": "Campus Restinga",
    },
    {
        "nome": "Sala 403",
        "capacidade": 25,
        "predio_bloco": "Bloco B",
        "recursos_disponiveis": "Computadores e internet",
        "ativo": True,
        "local_nome": "Campus Restinga",
    },
    {
        "nome": "Laboratório de Informática 2",
        "capacidade": 40,
        "predio_bloco": "Bloco B",
        "recursos_disponiveis": "Computadores e internet",
        "ativo": True,
        "local_nome": "Campus Restinga",
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

TEMPLATES_SISTEMA_DATA = [
    {
        "nome_exibicao": "E-mail de Boas Vindas",
        "assunto": "Bem-vindo ao Sistema!",
        "corpo_texto": (
            "Olá, {{ nome_usuario }} {{ sobrenome_usuario }}.\n\n"
            "Seu cadastro complementar no Sistema de Eventos foi realizado com Sucesso!.\n"
            "Seja muito bem-vindo!"
            "Agora no Site você pode se inscrever e gerenciar os eventos que você participa."
        ),
        "identificador": "welcome_email",
    }
]

# Dicionário de Mapeamento para as chaves reais salvas no Banco (TextChoices)
MAPA_AREAS_CHOICES = {
    "Ciências Exatas e da Terra": "CIENCIAS_EXATAS_E_DA_TERRA",
    "Ciências Biológicas": "CIENCIAS_BIOLOGICAS",
    "Engenharias": "ENGENHARIAS",
    "Ciências da Saúde": "CIENCIAS_DA_SAUDE",
    "Ciências Agrárias": "CIENCIAS_AGRARIAS",
    "Ciências Sociais Aplicadas": "CIENCIAS_SOCIAIS_APLICADAS",
    "Ciências Humanas": "CIENCIAS_HUMANAS",
    "Linguística, Letras e Artes": "LINGUISTICA_LETRAS_E_ARTES",
}

EVENTOS_DATA = [
    {
        "nome": "Semana Acadêmica de Tecnologia",
        "descricao": "Evento voltado para integração acadêmica com foco em inovação, pesquisa aplicada e formação técnica.",
        "status_evento": "EM_ANDAMENTO",
        "carga_horaria": 20,
        "setor": "ENSINO",
        "tema": "Inovação e Tecnologia",
        "link_edital": "https://ifrs.edu.br",
        "modalidades_nomes": ["Palestra", "Oficina", "Pôster"],
        "local_nome": "Campus Restinga",
        "areas_conhecimento": [
            "Ciências Exatas e da Terra",
            "Engenharias",
        ],
    },
    {
        "nome": "Mostra de Extensão",
        "descricao": "Apresentação de projetos, relatos e soluções desenvolvidas junto à comunidade.",
        "status_evento": "INSCRICOES_ABERTAS",
        "carga_horaria": 12,
        "setor": "EXTENSAO",
        "tema": "Integração",
        "link_edital": "https://ifrs.edu.br",
        "modalidades_nomes": ["Palestra", "Mesa-redonda"],
        "local_nome": "Campus Restinga",
        "areas_conhecimento": ["Ciências Humanas", "Ciências Sociais Aplicadas"],
    },
    {
        "nome": "Jornada de Pesquisa e Inovação",
        "descricao": "Espaço para apresentação de trabalhos científicos e avanços tecnológicos dos estudantes.",
        "status_evento": "EM_ANDAMENTO",
        "carga_horaria": 16,
        "setor": "PESQUISA",
        "tema": "Ciência, dados e inovação",
        "link_edital": "https://ifrs.edu.br",
        "modalidades_nomes": ["Palestra", "Oficina", "Pôster"],
        "local_nome": "Campus Restinga",
        "areas_conhecimento": [
            "Ciências Exatas e da Terra",
            "Ciências Biológicas",
            "Engenharias",
            "Linguística, Letras e Artes",
            "Ciências da Saúde",
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
        "data_inicio": "2026-04-01 08:00:00",
        "data_fim": "2026-06-15 23:59:59",
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
        "data_inicio": "2026-05-10 00:00:00",
        "data_fim": "2026-05-29 23:59:59",
    },
    {
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "tipo_etapa": "REALIZACAO_EVENTO",
        "data_inicio": "2026-10-20 08:00:00",
        "data_fim": "2026-10-22 18:00:00",
    },
]

AREAS_DATA = [
    {
        "area": "Ciências Exatas e da Terra",
        "descricao": "Ciências que estudam a matéria, as leis da natureza e fenômenos matemáticos.",
    },
    {
        "area": "Ciências Biológicas",
        "descricao": "Estudo dos organismos vivos, sua estrutura, funções, crescimento e evolução.",
    },
    {
        "area": "Engenharias",
        "descricao": "Aplicação de conhecimentos científicos e técnicos para a criação de soluções e infraestrutura.",
    },
    {
        "area": "Ciências da Saúde",
        "descricao": "Conhecimentos voltados para a prevenção, diagnóstico e tratamento de doenças.",
    },
    {
        "area": "Ciências Agrárias",
        "descricao": "Estudo de práticas agrícolas, pecuária e exploração sustentável de recursos naturais.",
    },
    {
        "area": "Ciências Sociais Aplicadas",
        "descricao": "Estudo dos aspectos sociais do mundo humano e das relações jurídicas e econômicas.",
    },
    {
        "area": "Ciências Humanas",
        "descricao": "Investigação do comportamento, cultura, história e sociedade humana.",
    },
    {
        "area": "Linguística, Letras e Artes",
        "descricao": "Estudo das linguagens, produção literária e manifestações artísticas e culturais.",
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
        "area_conhecimento": "Ciências Exatas e da Terra",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Robótica acessível para laboratórios escolares",
        "resumo": "Desenvolvimento de kits de baixo custo para ensino de robótica e automação em ambientes educacionais.",
        "palavras_chave": "robótica, educação, automação",
        "evento_nome": "Semana Acadêmica de Tecnologia",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "ENSINO_MEDIO_INTEGRADO",
        "area_conhecimento": "Engenharias",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Horta comunitária e segurança alimentar",
        "resumo": "Relato de experiência de uma ação extensionista com foco em alimentação saudável e sustentabilidade.",
        "palavras_chave": "extensão, comunidade, sustentabilidade",
        "evento_nome": "Mostra de Extensão",
        "modalidade_nome": "Palestra",
        "nivel_ensino": "SUBSEQUENTE",
        "area_conhecimento": "Ciências Humanas",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Tecnologias sociais para economia solidária",
        "resumo": "Apresentação de soluções sociais desenvolvidas em parceria com associações locais.",
        "palavras_chave": "tecnologia social, economia solidária, extensão",
        "evento_nome": "Mostra de Extensão",
        "modalidade_nome": "Mesa-redonda",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Ciências Sociais Aplicadas",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Biodiversidade e compostos bioativos da mata nativa",
        "resumo": "Trabalho científico investigando potenciais aplicações farmacológicas de espécies vegetais da região sul.",
        "palavras_chave": "biodiversidade, biologia, bioativos",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Pôster",
        "nivel_ensino": "MESTRADO",
        "area_conhecimento": "Ciências Biológicas",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Monitoramento de dados para eficiência energética",
        "resumo": "Aplicação de análise de dados para reduzir consumo elétrico em espaços institucionais.",
        "palavras_chave": "dados, energia, eficiência",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "POS_GRADUACAO",
        "area_conhecimento": "Engenharias",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Robótica: uso de lego",
        "resumo": "Lego. Desenvolvimento de kits de baixo custo para ensino de robótica.",
        "palavras_chave": "robótica, educação, automação",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Pôster",
        "nivel_ensino": "ENSINO_MEDIO_INTEGRADO",
        "area_conhecimento": "Engenharias",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Artes visuais: pintura moderna",
        "resumo": "Projeto artístico em escolas de ensino médio.",
        "palavras_chave": "artes, pintura, moderna",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "ENSINO_MEDIO_INTEGRADO",
        "area_conhecimento": "Linguística, Letras e Artes",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "IF Niños",
        "resumo": "Projeto de ensino de espanhol para crianças e adolescentes.",
        "palavras_chave": "espanhol, educação, crianças",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Linguística, Letras e Artes",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Ciclo de leituras",
        "resumo": "Série de leituras e discussões sobre textos literários.",
        "palavras_chave": "leitura, literatura, discussão",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Oficina",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Linguística, Letras e Artes",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Esporte na vida adulta",
        "resumo": "Discussões sobre a importância do esporte na vida dos adultos.",
        "palavras_chave": "esporte, saúde, vida adulta",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Palestra",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Ciências da Saúde",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Dança e expressão corporal",
        "resumo": "Exploração da dança como forma de expressão e bem-estar físico e emocional.",
        "palavras_chave": "dança, expressão corporal, bem-estar",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Pôster",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Ciências da Saúde",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Tênis de mesa, um esporte para todas as idades",
        "resumo": "Apresentação dos benefícios do tênis de mesa para a saúde física e mental em diferentes faixas etárias.",
        "palavras_chave": "esporte, saúde, vida adulta",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Pôster",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Ciências da Saúde",
        "status": "CONFIRMADA",
    },
    {
        "titulo": "Vivendo bem: a importância do esporte na vida adulta",
        "resumo": "Exploração dos benefícios do esporte para a saúde e qualidade de vida dos adultos.",
        "palavras_chave": "esporte, saúde, vida adulta",
        "evento_nome": "Jornada de Pesquisa e Inovação",
        "modalidade_nome": "Palestra",
        "nivel_ensino": "GRADUACAO",
        "area_conhecimento": "Ciências da Saúde",
        "status": "CONFIRMADA",
    },
]


def setup_django():
    # Obtém o caminho absoluto da pasta onde este script está (backend/scripts)
    script_dir = os.path.dirname(
        os.path.abspath(__file__)
    )  # espero que funcione em qualquer S.O

    # Obtém o caminho da pasta pai (backend)
    raiz_projeto = os.path.dirname(script_dir)

    # Adiciona a raiz do projeto ao PYTHONPATH do sistema
    sys.path.append(raiz_projeto)

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
        chave_db = MAPA_AREAS_CHOICES.get(item["area"], item["area"])
        area, created = AreaConhecimento.objects.get_or_create(
            area_conhecimento=chave_db, defaults={"descricao": item["descricao"]}
        )
        if created:
            created_count += 1
    print(f"Seed de áreas finalizada. Criadas: {created_count}")


def seed_eventos():
    from api.models.area_conhecimento import AreaConhecimento
    from api.models.evento import Evento
    from api.models.local import Local
    from api.models.modalidade import Modalidade

    for item in EVENTOS_DATA:
        local = Local.objects.filter(nome__iexact=item["local_nome"]).first()

        evento = Evento.objects.filter(nome__iexact=item["nome"]).first()
        created = False

        if not evento:
            evento = Evento.objects.create(
                nome=item["nome"],
                descricao=item["descricao"],
                status_evento=item["status_evento"],
                carga_horaria=item["carga_horaria"],
                setor=item["setor"],
                tema=item["tema"],
                link_edital=item["link_edital"],
                local=local,
            )
            created = True

        mods = Modalidade.objects.filter(nome__in=item["modalidades_nomes"])
        evento.modalidades.set(mods)

        chaves_areas = [
            MAPA_AREAS_CHOICES.get(nome, nome) for nome in item["areas_conhecimento"]
        ]
        areas = AreaConhecimento.objects.filter(area_conhecimento__in=chaves_areas)
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

        # Converte o nome amigável para a chave de choice correspondente (ex: "CIENCIAS_EXATAS_E_DA_TERRA")
        chave_area = MAPA_AREAS_CHOICES.get(
            item["area_conhecimento"], item["area_conhecimento"]
        )

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
            area_conhecimento=chave_area,
            evento=evento,
            status=item["status"],
            sou_orientador=False,
            acessibilidade=False,
            slug=slugify(item["titulo"]),
        )
        atracao.full_clean()
        atracao.save()
        created.append(atracao.titulo)

    print("Seed de atracoes finalizada.")
    print(f"Criadas: {created if created else 'nenhuma'}")
    print(f"Ja existiam: {existing if existing else 'nenhuma'}")


def seed_etapas():
    from django.utils import timezone
    from django.utils.dateparse import parse_datetime

    from api.models.etapa_evento import EtapaEvento
    from api.models.evento import Evento

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
        try:
            User.objects.create_superuser(
                username=username, email="admin@example.com", password=password
            )
            print(f"Superusuário '{username}' criado com sucesso.")
        except TypeError:
            user = User.objects.create_superuser(username=username, password=password)
            print(f"Superusuário '{username}' criado (compatibilidade sem email).")

    group, _ = Group.objects.get_or_create(name=group_name)
    user = User.objects.get(username=username)
    user.groups.add(group)
    user.save()
    print(f"Usuário '{username}' adicionado ao grupo '{group_name}'.")


def seed_templates_sistema():
    from emails.models import TemplateSistema

    created = []
    existing = []

    for item in TEMPLATES_SISTEMA_DATA:
        template, was_created = TemplateSistema.objects.get_or_create(
            identificador=item["identificador"],
            defaults={
                "nome_exibicao": item["nome_exibicao"],
                "assunto": item["assunto"],
                "corpo_texto": item["corpo_texto"],
            },
        )

        if was_created:
            created.append(template.identificador)
        else:
            existing.append(template.identificador)

    print("Seed de templates de sistema finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


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
    seed_templates_sistema()
    seed_admin_user()
    print("Script finalizado!")
    input("\nPressione Enter para sair...")
