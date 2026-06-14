import json

from guardian.shortcuts import get_objects_for_user
from rest_framework import serializers

from ..enumerations.status_submissao import StatusSubmissao
from ..enumerations.tipo_autoria import TipoAutoria
from ..models.atracao import Atracao
from ..models.autoria import Autoria
from ..models.campo_formulario import CampoFormulario
from ..models.coautor import Coautor
from ..models.evento import Evento
from ..models.resposta import Resposta
from ..models.submissao import Submissao


def _valor_esta_preenchido(valor):
    return valor not in (None, '', [], {})


def extrair_dados_submissao(dados_atracao, dados_submissao, campos_submissao):
    return {
        campo: dados_submissao.get(campo, dados_atracao.get(campo))
        for campo in campos_submissao
    }


def atualizar_submissao(submissao, dados_submissao):
    campos_para_atualizar = []
    for campo, valor in dados_submissao.items():
        if getattr(submissao, campo) != valor:
            setattr(submissao, campo, valor)
            campos_para_atualizar.append(campo)

    if campos_para_atualizar:
        submissao.save(update_fields=campos_para_atualizar)


def normalizar_coautores_legacy(equipe_data):
    if not isinstance(equipe_data, list):
        return []

    membros_normalizados = []
    for membro in equipe_data:
        if not isinstance(membro, dict):
            continue

        nome = str(membro.get('nome') or '').strip()
        if not nome:
            continue

        membros_normalizados.append(
            {
                'nome': nome,
                'instituicao_curso': membro.get('instituicao_curso') or '',
                'funcao': membro.get('funcao') or TipoAutoria.COAUTOR,
            }
        )

    return membros_normalizados


def _validar_autoria_por_perfil(usuario_solicitante, autorias_normalizadas, evento):
    if usuario_solicitante is None or not autorias_normalizadas:
        return

    autoria_autor = next(
        (a for a in autorias_normalizadas if a['tipo'] == TipoAutoria.AUTOR),
        None,
    )
    if autoria_autor is None:
        return

    autor_id = autoria_autor['usuario_id']
    eh_admin = usuario_solicitante.is_superuser or usuario_solicitante.groups.filter(
        name="Administrador"
    ).exists()
    eh_coordenador = usuario_solicitante.groups.filter(name="Coordenador").exists()

    if eh_admin:
        if autor_id == usuario_solicitante.id:
            raise serializers.ValidationError(
                {
                    'autoria_json': (
                        'Administrador deve informar outro usuário como AUTOR.'
                    )
                }
            )
        return

    if eh_coordenador:
        if autor_id == usuario_solicitante.id:
            if evento is None:
                raise serializers.ValidationError(
                    {
                        'autoria_json': (
                            'Coordenador só pode se incluir como AUTOR quando estiver '
                            'coordenando o evento selecionado.'
                        )
                    }
                )

            coordena_evento = get_objects_for_user(
                usuario_solicitante,
                'api.coordenar_evento',
                klass=Evento,
            ).filter(pk=evento.pk).exists()

            if not coordena_evento:
                raise serializers.ValidationError(
                    {
                        'autoria_json': (
                            'Coordenador só pode se incluir como AUTOR quando estiver '
                            'coordenando o evento selecionado.'
                        )
                    }
                )
        return

    if autor_id != usuario_solicitante.id:
        raise serializers.ValidationError(
            {
                'autoria_json': (
                    'Para este perfil, o usuário autenticado deve ser o AUTOR da submissão.'
                )
            }
        )


def normalizar_autorias(autoria_data, usuario_solicitante=None, evento=None):
    if not isinstance(autoria_data, list):
        return []

    tipos_validos = {choice[0] for choice in TipoAutoria.choices}
    autorias_normalizadas = []
    usuarios_vistos = set()
    ordens_vistas = set()

    for index, item in enumerate(autoria_data):
        if not isinstance(item, dict):
            continue

        usuario_id = item.get('usuario') or item.get('user_id')
        if usuario_id in (None, ''):
            continue

        try:
            usuario_id = int(usuario_id)
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                {'autoria_json': f'Usuário inválido na posição {index + 1}.'}
            )

        if usuario_id in usuarios_vistos:
            raise serializers.ValidationError(
                {'autoria_json': 'Um mesmo usuário não pode aparecer mais de uma vez.'}
            )
        usuarios_vistos.add(usuario_id)

        tipo_valor = item.get('tipo') or item.get('funcao')
        tipo = str(tipo_valor or '').strip().upper()
        if tipo not in tipos_validos:
            raise serializers.ValidationError(
                {
                    'autoria_json': (
                        f'Tipo de autoria inválido na posição {index + 1}. '
                        'Use AUTOR, COAUTOR ou ORIENTADOR.'
                    )
                }
            )

        ordem = item.get('ordem', index + 1)
        try:
            ordem = int(ordem)
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                {'autoria_json': f'Ordem inválida na posição {index + 1}.'}
            )

        if ordem <= 0:
            raise serializers.ValidationError(
                {'autoria_json': f'A ordem deve ser maior que zero na posição {index + 1}.'}
            )

        if ordem in ordens_vistas:
            raise serializers.ValidationError(
                {'autoria_json': 'A ordem de autoria não pode se repetir.'}
            )
        ordens_vistas.add(ordem)

        autorias_normalizadas.append(
            {
                'usuario_id': usuario_id,
                'tipo': tipo,
                'ordem': ordem,
            }
        )

    if autorias_normalizadas:
        total_autores = len(
            [a for a in autorias_normalizadas if a['tipo'] == TipoAutoria.AUTOR]
        )
        if total_autores != 1:
            raise serializers.ValidationError(
                {'autoria_json': 'A submissão deve possuir exatamente 1 AUTOR.'}
            )

    _validar_autoria_por_perfil(usuario_solicitante, autorias_normalizadas, evento)

    return autorias_normalizadas


def sincronizar_autorias(submissao, autorias_data):
    if not isinstance(autorias_data, list):
        return

    submissao.autorias.all().delete()
    if not autorias_data:
        return

    autorias_ordenadas = sorted(
        autorias_data, key=lambda autoria: autoria.get('ordem', 0)
    )
    objetos = [Autoria(submissao=submissao, **autoria) for autoria in autorias_ordenadas]
    Autoria.objects.bulk_create(objetos)


def sincronizar_respostas(submissao, respostas_campos_data):
    Resposta.objects.filter(submissao=submissao).delete()

    if not isinstance(respostas_campos_data, dict):
        return

    modalidade_id = submissao.modalidade_id
    if not modalidade_id:
        return

    campos_ids_validos = set(
        CampoFormulario.objects.filter(
            modalidade_id=modalidade_id, ativo=True
        ).values_list('id', flat=True)
    )

    respostas_para_criar = []
    for chave, valor in respostas_campos_data.items():
        if not isinstance(chave, str) or not chave.startswith('campo_'):
            continue

        try:
            campo_id = int(chave.replace('campo_', '', 1))
        except (TypeError, ValueError):
            continue

        if campo_id not in campos_ids_validos:
            continue

        if valor is None:
            continue

        valor_texto = str(valor)
        if valor_texto.strip() == '':
            continue

        respostas_para_criar.append(
            Resposta(
                submissao=submissao,
                campo_formulario_id=campo_id,
                valor=valor_texto,
            )
        )

    if respostas_para_criar:
        Resposta.objects.bulk_create(respostas_para_criar)


def _sincronizar_dados_submissao(
    submissao,
    dados_submissao,
    equipe_data,
    autoria_data,
    respostas_campos_data,
    usuario_solicitante=None,
    evento=None,
):
    atualizar_submissao(submissao, dados_submissao)
    evento_referencia = evento or getattr(submissao, 'evento', None)

    if isinstance(equipe_data, list):
        submissao.equipe.all().delete()
        equipe_legacy_normalizada = normalizar_coautores_legacy(equipe_data)
        for membro in equipe_legacy_normalizada:
            if membro.get('nome'):
                Coautor.objects.create(submissao=submissao, **membro)

    if isinstance(autoria_data, list):
        autorias_normalizadas = normalizar_autorias(
            autoria_data,
            usuario_solicitante=usuario_solicitante,
            evento=evento_referencia,
        )
        sincronizar_autorias(submissao, autorias_normalizadas)
    elif isinstance(equipe_data, list):
        autorias_normalizadas = normalizar_autorias(
            equipe_data,
            usuario_solicitante=usuario_solicitante,
            evento=evento_referencia,
        )
        if autorias_normalizadas:
            sincronizar_autorias(submissao, autorias_normalizadas)

    if isinstance(respostas_campos_data, dict):
        sincronizar_respostas(submissao, respostas_campos_data)


def criar_atracao_com_submissao(validated_data, campos_submissao, usuario_solicitante=None):
    equipe_data = validated_data.pop('equipe_json', [])
    autoria_data = validated_data.pop('autoria_json', [])
    respostas_campos_data = validated_data.pop('respostas_campos_json', {})
    submissao_payload = validated_data.pop('submissao', {})

    espaco = validated_data.get('espaco')
    if espaco:
        validated_data['local_atracao'] = str(espaco)

    dados_submissao = extrair_dados_submissao(validated_data, submissao_payload, campos_submissao)
    submissao = None
    evento_referencia = dados_submissao.get('evento')
    if any(_valor_esta_preenchido(valor) for valor in dados_submissao.values()):
        submissao = Submissao.objects.create(
            status_submissao=StatusSubmissao.SUBMETIDA,
            **dados_submissao,
        )

    atracao = Atracao.objects.create(submissao=submissao, **validated_data)

    if submissao is not None:
        _sincronizar_dados_submissao(
            submissao,
            dados_submissao,
            equipe_data,
            autoria_data,
            respostas_campos_data,
            usuario_solicitante=usuario_solicitante,
            evento=evento_referencia,
        )

    return atracao


def atualizar_atracao_com_submissao(
    instance,
    validated_data,
    campos_submissao,
    usuario_solicitante=None,
):
    equipe_data = validated_data.pop('equipe_json', None)
    autoria_data = validated_data.pop('autoria_json', None)
    respostas_campos_data = validated_data.pop('respostas_campos_json', None)
    submissao_payload = validated_data.pop('submissao', {})

    espaco = validated_data.get('espaco')
    if espaco:
        validated_data['local_atracao'] = str(espaco)

    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()

    dados_submissao = extrair_dados_submissao(validated_data, submissao_payload, campos_submissao)
    submissao = instance.submissao
    evento_referencia = dados_submissao.get('evento') or getattr(submissao, 'evento', None)

    if submissao is None and any(_valor_esta_preenchido(valor) for valor in dados_submissao.values()):
        submissao = Submissao.objects.create(
            status_submissao=StatusSubmissao.SUBMETIDA,
            **dados_submissao,
        )
        instance.submissao = submissao
        instance.save(update_fields=['submissao'])

    if submissao is not None and any(_valor_esta_preenchido(valor) for valor in dados_submissao.values()):
        _sincronizar_dados_submissao(
            submissao,
            dados_submissao,
            equipe_data,
            autoria_data,
            respostas_campos_data,
            usuario_solicitante=usuario_solicitante,
            evento=evento_referencia,
        )
    elif submissao is not None:
        if isinstance(equipe_data, list) and equipe_data:
            submissao.equipe.all().delete()
            equipe_legacy_normalizada = normalizar_coautores_legacy(equipe_data)
            for membro in equipe_legacy_normalizada:
                if membro.get('nome'):
                    Coautor.objects.create(submissao=submissao, **membro)

        if isinstance(autoria_data, list):
            autorias_normalizadas = normalizar_autorias(
                autoria_data,
                usuario_solicitante=usuario_solicitante,
                evento=evento_referencia,
            )
            sincronizar_autorias(submissao, autorias_normalizadas)
        elif isinstance(equipe_data, list):
            autorias_normalizadas = normalizar_autorias(
                equipe_data,
                usuario_solicitante=usuario_solicitante,
                evento=evento_referencia,
            )
            if autorias_normalizadas:
                sincronizar_autorias(submissao, autorias_normalizadas)

        if isinstance(respostas_campos_data, dict):
            sincronizar_respostas(submissao, respostas_campos_data)

    return instance
