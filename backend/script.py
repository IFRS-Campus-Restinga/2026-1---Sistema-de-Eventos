import os
import django


GROUP_NAMES = ["Administrador", "Coordenador", "Organizador", "Convidado", "Aluno", "Servidor"]

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
        "emite_certificado": True,
        "ativo": True,
    },
    {
        "nome": "Oficina",
        "requer_avaliacao": True,
        "emite_certificado": True,
        "ativo": True,
    },
]

EVENTOS_DATA = [
    {
        "nome": "Semana Acadêmica de Tecnologia",
        "descricao": "Evento voltado para integração acadêmica, palestras e oficinas de tecnologia.",
        "status_evento": "EM_PLANEJAMENTO",
        "carga_horaria": 20,
        "setor": "ENSINO",
        "tema": "Inovação e Tecnologia",
        "modalidades_nomes": ["Palestra", "Oficina"],
    },
    {
        "nome": "Mostra de Extensão",
        "descricao": "Apresentação de projetos e ações de extensão desenvolvidos no campus.",
        "status_evento": "INSCRICOES_ABERTAS",
        "carga_horaria": 12,
        "setor": "EXTENSAO",
        "tema": "Integração com a Comunidade",
        "modalidades_nomes": ["Palestra"],
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


def seed_eventos():
    from api.models.evento import Evento
    from api.models.modalidade import Modalidade

    created = []
    existing = []

    for item in EVENTOS_DATA:
        modalidades = list(
            Modalidade.objects.filter(nome__in=item["modalidades_nomes"])
        )
        if len(modalidades) != len(item["modalidades_nomes"]):
            raise RuntimeError(
                f"Modalidades base ausentes para o evento '{item['nome']}'. Rode seed_modalidades antes de seed_eventos."
            )

        evento = Evento.objects.filter(nome__iexact=item["nome"]).first()

        if evento:
            existing.append(evento.nome)
            continue

        evento = Evento(
            nome=item["nome"],
            descricao=item["descricao"],
            status_evento=item["status_evento"],
            carga_horaria=item["carga_horaria"],
            setor=item["setor"],
            tema=item["tema"],
        )
        evento.full_clean()
        evento.save()
        evento.modalidades.set(modalidades)
        created.append(evento.nome)

    print("Seed de eventos finalizada.")
    print(f"Criados: {created if created else 'nenhum'}")
    print(f"Ja existiam: {existing if existing else 'nenhum'}")


if __name__ == "__main__":
    setup_django()
    seed_groups()
    seed_locais()
    seed_espacos()
    seed_modalidades()
    seed_eventos()
