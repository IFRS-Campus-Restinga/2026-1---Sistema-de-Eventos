import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useState } from 'react';

export default function EditarAtracaoModal({
    show = false,
    formEdicao,
    setFormEdicao,
    permitirEdicaoStatus = false,
    opcoesStatus = [],
    opcoesEdicao,
    modalidadeEdicaoDetalhe,
    habilitarSugestaoVagasEdicao,
    setHabilitarSugestaoVagasEdicao,
    contarPalavras,
    LIMITS_EDICAO,
    selecionarNivelEnsinoEdicao,
    getAreasEventoEdicao,
    normalizarAreaEdicao,
    getNomeUsuario,
    getNivelEnsinoMembroEdicao,
    getUsuariosDisponiveisLinhaEdicao,
    handleAdicionarMembroEdicao,
    handleRemoverMembroEdicao,
    handleMembroEdicaoChange,
    salvandoEdicao = false,
    somenteLeitura = false,
    onClose,
    onSalvar,
}) {
    const [buscasUsuariosEdicao, setBuscasUsuariosEdicao] = useState({});
    const modalidadePermiteSugestaoVagas =
        modalidadeEdicaoDetalhe?.requer_controle_vagas === true;

    const normalizarTexto = (texto) =>
        (texto || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

    const formatarPerfilAcesso = (perfil) => {
        const perfilNormalizado = normalizarTexto(perfil);
        const perfisConhecidos = {
            aluno: 'Aluno',
            servidor: 'Servidor',
            convidado: 'Convidado',
            administrador: 'Administrador',
            admin: 'Administrador',
        };

        return perfisConhecidos[perfilNormalizado] || null;
    };

    const getValorBuscaUsuarioEdicao = (membro, index, usuariosDisponiveis) => {
        if (Object.prototype.hasOwnProperty.call(buscasUsuariosEdicao, index)) {
            return buscasUsuariosEdicao[index];
        }

        if (membro?.nome) {
            return membro.nome;
        }

        if (membro?.user_id) {
            const usuarioSelecionado = (usuariosDisponiveis || []).find(
                (usuario) => String(usuario.id) === String(membro.user_id),
            );
            if (usuarioSelecionado) {
                return getNomeUsuario(usuarioSelecionado);
            }
        }

        return '';
    };

    const getUsuariosFiltradosLinhaEdicao = (usuariosDisponiveis, valorBusca) => {
        const termo = normalizarTexto((valorBusca || '').trim());
        if (termo.length < 3) {
            return [];
        }

        return (usuariosDisponiveis || [])
            .filter((usuario) => {
                const nome = normalizarTexto(getNomeUsuario(usuario));
                const username = normalizarTexto(usuario?.username || '');
                const email = normalizarTexto(usuario?.email || '');

                return (
                    nome.includes(termo) ||
                    username.includes(termo) ||
                    email.includes(termo)
                );
            })
            .slice(0, 10);
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            size="xl"
            dialogClassName="modal-editar-atracao-expandido"
        >
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#00A44B' }}>
                    {somenteLeitura ? 'Detalhes da Submissão/Atração' : 'Editar Submissão'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <fieldset disabled={somenteLeitura}>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                            Título
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={formEdicao.titulo || ''}
                            onChange={(e) =>
                                setFormEdicao((prev) => ({
                                    ...prev,
                                    titulo: e.target.value,
                                }))
                            }
                        />
                        <Form.Text className="text-muted">
                            {contarPalavras(formEdicao.titulo || '')}/{LIMITS_EDICAO.titulo.maxWords} palavras
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                            Resumo
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={formEdicao.resumo || ''}
                            onChange={(e) =>
                                setFormEdicao((prev) => ({
                                    ...prev,
                                    resumo: e.target.value,
                                }))
                            }
                        />
                    </Form.Group>

                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Modalidade
                                </Form.Label>
                                <Form.Select
                                    value={formEdicao.modalidade || ''}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            modalidade: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Selecione a modalidade</option>
                                    {opcoesEdicao.modalidades.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </Form.Select>

                                {modalidadeEdicaoDetalhe && modalidadePermiteSugestaoVagas && (
                                    <div className="mt-2">
                                        <Form.Check
                                            type="checkbox"
                                            id="edicao-habilitar-sugestao-vagas"
                                            label="Habilitar sugestão para número de vagas"
                                            className="mb-2"
                                            checked={habilitarSugestaoVagasEdicao}
                                            onChange={(e) => {
                                                const habilitado = e.target.checked;
                                                setHabilitarSugestaoVagasEdicao(habilitado);
                                                if (!habilitado) {
                                                    setFormEdicao((prev) => ({
                                                        ...prev,
                                                        sugestao_vagas: '',
                                                    }));
                                                }
                                            }}
                                        />

                                        {habilitarSugestaoVagasEdicao && (
                                            <>
                                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                                    Sugestão para Número de Vagas
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    max={
                                                        (modalidadeEdicaoDetalhe.limite_maximo_vagas ??
                                                            modalidadeEdicaoDetalhe.limite_vagas) > 0
                                                            ? (modalidadeEdicaoDetalhe.limite_maximo_vagas ??
                                                              modalidadeEdicaoDetalhe.limite_vagas)
                                                            : undefined
                                                    }
                                                    value={formEdicao.sugestao_vagas ?? ''}
                                                    onChange={(e) =>
                                                        setFormEdicao((prev) => ({
                                                            ...prev,
                                                            sugestao_vagas:
                                                                e.target.value === ''
                                                                    ? ''
                                                                    : Number(e.target.value),
                                                        }))
                                                    }
                                                    placeholder="Ex: 30"
                                                />
                                            </>
                                        )}

                                        <Form.Text className="text-muted">
                                            {(modalidadeEdicaoDetalhe.limite_maximo_vagas ??
                                                modalidadeEdicaoDetalhe.limite_vagas) > 0
                                                ? `Limite definido para esta modalidade: ${modalidadeEdicaoDetalhe.limite_maximo_vagas ?? modalidadeEdicaoDetalhe.limite_vagas} vagas.`
                                                : 'Esta modalidade não possui limite de vagas definido.'}
                                        </Form.Text>
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        {permitirEdicaoStatus && (
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                        Status
                                    </Form.Label>
                                    <Form.Select
                                        value={formEdicao.status || ''}
                                        onChange={(e) =>
                                            setFormEdicao((prev) => ({
                                                ...prev,
                                                status: e.target.value,
                                            }))
                                        }
                                        style={{ backgroundColor: '#eeeeee' }}
                                    >
                                        {opcoesStatus.map((statusOpcao) => (
                                            <option
                                                key={statusOpcao.value}
                                                value={statusOpcao.value}
                                            >
                                                {statusOpcao.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        )}
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Nivel de Ensino
                                </Form.Label>
                                <Form.Select
                                    value={String(formEdicao.nivel_ensino || '')}
                                    onChange={(e) => selecionarNivelEnsinoEdicao(e.target.value)}
                                    style={{ backgroundColor: '#eeeeee' }}
                                >
                                    <option value="">Selecione um nível de ensino</option>
                                    {opcoesEdicao.niveis_ensino.map((opt) => (
                                        <option key={opt.value} value={String(opt.value)}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Area do Conhecimento
                                </Form.Label>
                                <Form.Select
                                    value={formEdicao.area_conhecimento || ''}
                                    disabled={!formEdicao.evento}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            area_conhecimento: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="">
                                        {formEdicao.evento
                                            ? (getAreasEventoEdicao().length > 0
                                                ? 'Selecione a area'
                                                : 'Evento sem areas configuradas')
                                            : 'Selecione primeiro um evento'}
                                    </option>
                                    {getAreasEventoEdicao().map((area) => {
                                        const normalizada = normalizarAreaEdicao(area);
                                        return (
                                            <option key={normalizada.value} value={normalizada.value}>
                                                {normalizada.label}
                                            </option>
                                        );
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                            Palavras-chave
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={formEdicao.palavras_chave || ''}
                            maxLength={LIMITS_EDICAO.palavrasChave.maxChars}
                            onChange={(e) =>
                                setFormEdicao((prev) => ({
                                    ...prev,
                                    palavras_chave: e.target.value,
                                }))
                            }
                        />
                        <Form.Text className="text-muted">
                            {(formEdicao.palavras_chave || '').length}/{LIMITS_EDICAO.palavrasChave.maxChars} caracteres
                        </Form.Text>
                    </Form.Group>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Recursos
                                </Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    id="edicao-acessibilidade"
                                    label="Necessita recursos de acessibilidade"
                                    checked={!!formEdicao.acessibilidade}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            acessibilidade: e.target.checked,
                                        }))
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="fw-bold mb-0" style={{ color: '#00A44B' }}>
                            Membros da Equipe
                        </Form.Label>
                        {!somenteLeitura && (
                            <Button variant="outline-primary" size="sm" onClick={handleAdicionarMembroEdicao}>
                                Adicionar membro
                            </Button>
                        )}
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Nível de Ensino</th>
                                    <th>Papel</th>
                                    <th style={{ width: '90px' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(formEdicao.equipe || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted">
                                            Nenhum membro informado.
                                        </td>
                                    </tr>
                                ) : (
                                    (formEdicao.equipe || []).map((membro, index) => (
                                        <tr key={index}>
                                            <td>
                                                {(() => {
                                                    const usuariosDisponiveis = getUsuariosDisponiveisLinhaEdicao(index);
                                                    const valorBusca = getValorBuscaUsuarioEdicao(
                                                        membro,
                                                        index,
                                                        usuariosDisponiveis,
                                                    );
                                                    const usuariosFiltrados = getUsuariosFiltradosLinhaEdicao(
                                                        usuariosDisponiveis,
                                                        valorBusca,
                                                    );
                                                    const podeExibirResultados = valorBusca.trim().length >= 3;

                                                    return (
                                                        <div className="d-flex flex-column gap-2">
                                                            <Form.Control
                                                                type="text"
                                                                value={valorBusca}
                                                                onChange={(e) => {
                                                                    const texto = e.target.value;
                                                                    setBuscasUsuariosEdicao((prev) => ({
                                                                        ...prev,
                                                                        [index]: texto,
                                                                    }));

                                                                    if (membro.user_id) {
                                                                        handleMembroEdicaoChange(index, 'user_id', '');
                                                                    }
                                                                }}
                                                                placeholder="Digite nome, username ou e-mail"
                                                            />

                                                            {!membro.user_id &&
                                                                podeExibirResultados &&
                                                                usuariosFiltrados.length > 0 && (
                                                                    <div
                                                                        className="border rounded bg-white shadow-sm"
                                                                        style={{ maxHeight: '220px', overflowY: 'auto' }}
                                                                    >
                                                                        {usuariosFiltrados.map((usuario) => (
                                                                            <button
                                                                                key={usuario.id}
                                                                                type="button"
                                                                                className="w-100 text-start border-0 px-3 py-2 bg-white"
                                                                                style={{ borderBottom: '1px solid #eee' }}
                                                                                onClick={() => {
                                                                                    handleMembroEdicaoChange(
                                                                                        index,
                                                                                        'user_id',
                                                                                        usuario.id,
                                                                                    );
                                                                                    setBuscasUsuariosEdicao((prev) => ({
                                                                                        ...prev,
                                                                                        [index]: getNomeUsuario(usuario),
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                <div className="fw-semibold text-dark">
                                                                                    {getNomeUsuario(usuario)}
                                                                                </div>
                                                                                {formatarPerfilAcesso(
                                                                                    usuario.access_profile,
                                                                                ) && (
                                                                                    <div className="small text-muted">
                                                                                        Perfil:{' '}
                                                                                        {formatarPerfilAcesso(
                                                                                            usuario.access_profile,
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                            {!membro.user_id &&
                                                                podeExibirResultados &&
                                                                usuariosFiltrados.length === 0 && (
                                                                    <Form.Text className="text-muted">
                                                                        Nenhum usuário encontrado.
                                                                    </Form.Text>
                                                                )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td>
                                                <Form.Control
                                                    value={getNivelEnsinoMembroEdicao(membro)}
                                                    placeholder="Nível de ensino (auto-preenchido)"
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <Form.Select
                                                    value={membro.funcao || ''}
                                                    disabled={!membro.user_id && !membro.nome}
                                                    onChange={(e) =>
                                                        handleMembroEdicaoChange(
                                                            index,
                                                            'funcao',
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">Selecione</option>
                                                    <option
                                                        value="AUTOR"
                                                        disabled={
                                                            (formEdicao.equipe || []).some(
                                                                (item, i) =>
                                                                    i !== index && item?.funcao === 'AUTOR',
                                                            )
                                                        }
                                                    >
                                                        Autor
                                                    </option>
                                                    <option value="COAUTOR">Co-autor</option>
                                                    <option value="ORIENTADOR">Orientador</option>
                                                </Form.Select>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    disabled={somenteLeitura}
                                                    onClick={() => handleRemoverMembroEdicao(index)}
                                                >
                                                    Remover
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    {somenteLeitura ? 'Fechar' : 'Cancelar'}
                </Button>
                {!somenteLeitura && (
                    <Button
                        variant="success"
                        style={{ backgroundColor: '#00A44B', border: 'none' }}
                        disabled={salvandoEdicao}
                        onClick={onSalvar}
                    >
                        {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}