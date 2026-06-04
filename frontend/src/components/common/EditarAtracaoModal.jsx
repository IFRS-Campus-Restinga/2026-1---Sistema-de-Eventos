import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

export default function EditarAtracaoModal({
    show = false,
    formEdicao,
    setFormEdicao,
    opcoesEdicao,
    modalidadeEdicaoDetalhe,
    habilitarSugestaoVagasEdicao,
    setHabilitarSugestaoVagasEdicao,
    contarPalavras,
    LIMITS_EDICAO,
    normalizarNiveisEnsino,
    toggleNivelEnsinoEdicao,
    getAreasEventoEdicao,
    normalizarAreaEdicao,
    getNomeUsuario,
    getNivelEnsinoMembroEdicao,
    getUsuariosDisponiveisLinhaEdicao,
    handleAdicionarMembroEdicao,
    handleRemoverMembroEdicao,
    handleMembroEdicaoChange,
    salvandoEdicao = false,
    onClose,
    onSalvar,
}) {
    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#00A44B' }}>Editar Submissão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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

                    <Row>
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

                                {modalidadeEdicaoDetalhe && (
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
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Nivel de Ensino
                                </Form.Label>
                                <div
                                    style={{
                                        backgroundColor: '#eeeeee',
                                        borderRadius: '0.375rem',
                                        padding: '0.75rem',
                                        border: '1px solid #ced4da',
                                    }}
                                >
                                    {opcoesEdicao.niveis_ensino.map((opt) => (
                                        <Form.Check
                                            key={opt.value}
                                            type="checkbox"
                                            id={`edicao-nivel-${opt.value}`}
                                            label={opt.label}
                                            checked={normalizarNiveisEnsino(formEdicao.nivel_ensino).includes(opt.value)}
                                            onChange={() => toggleNivelEnsinoEdicao(opt.value)}
                                            className="mb-1"
                                        />
                                    ))}
                                </div>
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

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold" style={{ color: '#00A44B' }}>
                                    Status de Avaliação
                                </Form.Label>
                                <Form.Select
                                    value={formEdicao.status || 'PREVISTA'}
                                    onChange={(e) =>
                                        setFormEdicao((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="RASCUNHO">RASCUNHO</option>
                                    <option value="PREVISTA">SUBMETIDA</option>
                                    <option value="CONFIRMADA">CONFIRMADA</option>
                                    <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                                    <option value="ENCERRADA">ENCERRADA</option>
                                    <option value="CANCELADA">CANCELADA</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="fw-bold mb-0" style={{ color: '#00A44B' }}>
                            Membros da Equipe
                        </Form.Label>
                        <Button variant="outline-primary" size="sm" onClick={handleAdicionarMembroEdicao}>
                            Adicionar membro
                        </Button>
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
                                                    return (
                                                        <Form.Select
                                                            value={membro.user_id || ''}
                                                            onChange={(e) =>
                                                                handleMembroEdicaoChange(
                                                                    index,
                                                                    'user_id',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">Selecione o usuário</option>
                                                            {usuariosDisponiveis.map((usuario) => (
                                                                <option key={usuario.id} value={usuario.id}>
                                                                    {getNomeUsuario(usuario)}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button
                    variant="success"
                    style={{ backgroundColor: '#00A44B', border: 'none' }}
                    disabled={salvandoEdicao}
                    onClick={onSalvar}
                >
                    {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}