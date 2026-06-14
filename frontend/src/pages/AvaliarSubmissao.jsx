import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Tag from '../components/common/Tag';
import Alerta from '../components/common/Alerta';
import { useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import useAvaliarSubmissao from '../hooks/useAvaliarSubmissao';
import { obterCorPorTag } from '../utils/themeTags';
import formatAreaConhecimento from '../utils/formatAreaConhecimento';

export default function AvaliarSubmissao() {
    const navigate = useNavigate();
    const [alerta, setAlerta] = useState(null);

    const params = new URLSearchParams(window.location.search);
    const submissaoId = params.get('submissao_id');
    const avaliacaoIdParam = params.get('avaliacao_id');

    const {
        submissao,
        criterios,
        itens,
        parecer,
        setParecer,
        statusAprovacao,
        setStatusAprovacao,
        loading,
        editingAllowed,
        handleNotaChange,
        handleSubmit,
        podeEnviar,
    } = useAvaliarSubmissao({ submissaoId, avaliacaoId: avaliacaoIdParam });

    useEffect(() => {
        // Impede o usuário de selecionar "Em Avaliação"
        if (editingAllowed && statusAprovacao === 'EM_AVALIACAO') {
            setStatusAprovacao('APROVADO');
        }
    }, [editingAllowed, statusAprovacao, setStatusAprovacao]);

    const onSubmit = async () => {
        if (!submissao) return;
        try {
            const res = await handleSubmit();
            if (res && res.success) {
                const redirectTimeout = 2000;
                setAlerta({
                    mensagem: 'Avaliação da submissão salva com sucesso',
                    variacao: 'success',
                    duracao: redirectTimeout,
                    reacao: Date.now(),
                });
                setTimeout(
                    () =>
                        navigate(
                            `/minhas_avaliacoes_submissoes?evento_id=${submissao.evento}`,
                        ),
                    redirectTimeout + 100,
                );
            } else {
                setAlerta({
                    mensagem: 'Erro ao enviar avaliação',
                    variacao: 'danger',
                    reacao: Date.now(),
                });
            }
        } catch {
            setAlerta({
                mensagem: 'Erro ao enviar avaliação',
                variacao: 'danger',
                reacao: Date.now(),
            });
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />
            <main className="py-4 px-3">
                <Container className="px-5 py-4 d-flex flex-column gap-3 shadow rounded-4 bg-white">
                    <Row>
                        <Col className="px-0">
                            <h1 className="fw-bold text-dark">
                                {submissao
                                    ? submissao.titulo
                                    : 'Carregando Submissão...'}
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="px-0 d-flex flex-wrap gap-2">
                            <Tag
                                corTexto="#fff"
                                corFundo="#003366"
                                texto={
                                    submissao?.nivel_ensino_display || 'Nível'
                                }
                            />
                            <Tag
                                corTexto="#fff"
                                corFundo={obterCorPorTag(
                                    formatAreaConhecimento(
                                        submissao?.area_conhecimento,
                                    ),
                                )}
                                texto={
                                    formatAreaConhecimento(
                                        submissao?.area_conhecimento,
                                    ) || 'Área'
                                }
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            className="rounded-2 fw-semibold p-3"
                            style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                            }}
                        >
                            Atribua notas de 0.0 a 10.0 para cada critério
                            avaliativo institucional utilizando ponto para
                            decimais.
                        </Col>
                    </Row>

                    {(criterios || []).map((c, idx) => (
                        <Row
                            key={c.id}
                            className="p-3 rounded-4 bg-light border mb-2"
                        >
                            <Col className="d-md-flex justify-content-between align-items-center">
                                <div className="d-flex flex-column gap-1">
                                    <span className="fw-bold fs-5 text-dark">{`${
                                        idx + 1
                                    }. ${c.nome}`}</span>
                                    <span className="text-muted small">
                                        {c.descricao}
                                    </span>
                                </div>
                                <input
                                    max={10}
                                    min={0}
                                    step={0.1}
                                    value={itens[idx]?.nota ?? ''}
                                    onChange={(e) =>
                                        handleNotaChange(idx, e.target.value)
                                    }
                                    type="number"
                                    className="score-input fs-4 window-input fw-bold text-center mt-3 mt-md-0"
                                    style={{
                                        width: '100px',
                                        height: '50px',
                                        borderRadius: '8px',
                                        border: '2px solid #cbd5e1',
                                    }}
                                    disabled={!editingAllowed}
                                    required
                                />
                            </Col>
                        </Row>
                    ))}

                    <Row className="d-flex flex-column gap-2 mt-2">
                        <Col className="px-0">
                            <label
                                htmlFor="parecer"
                                className="fw-bold fs-5 text-dark"
                            >
                                Parecer Descritivo da Banca
                            </label>
                        </Col>
                        <Col className="w-100 px-0">
                            <textarea
                                id="parecer"
                                placeholder="Escreva o parecer descritivo detalhado sobre a submissão de trabalho..."
                                rows={5}
                                className="form-control w-100 p-3 bg-light"
                                value={parecer}
                                onChange={(e) => setParecer(e.target.value)}
                                disabled={!editingAllowed}
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="mt-2">
                        <Col md={6} className="px-0">
                            <Form.Group>
                                <Form.Label className="fw-bold text-dark">
                                    Resultado / Status de Aprovação
                                </Form.Label>
                                <Form.Select
                                    value={statusAprovacao}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        // bloqueia seleção de "Em Avaliação" (segurança extra)
                                        if (next === 'EM_AVALIACAO') return;
                                        setStatusAprovacao(next);
                                    }}
                                    disabled={!editingAllowed}
                                    className="p-2 bg-light fw-semibold"
                                >
                                    <option value="EM_AVALIACAO" disabled>
                                        Em Avaliação
                                    </option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="APROVADO_COM_RESSALVAS">
                                        Aprovado com Ressalvas
                                    </option>
                                    <option value="REPROVADO">Reprovado</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="d-flex flex-column justify-content-center text-center my-3 p-3 bg-light rounded-3">
                        <Col className="small fw-bold text-secondary">
                            MÉDIA FINAL ARITMÉTICA
                        </Col>
                        <Col className="fw-bold display-4 text-success">
                            {(() => {
                                const vals = (itens || [])
                                    .map((i) => i.nota)
                                    .filter((n) => Number.isFinite(n));
                                if (!vals.length) return '--';
                                return (
                                    vals.reduce((a, b) => a + b, 0) /
                                    vals.length
                                )
                                    .toFixed(1)
                                    .replace('.', ',');
                            })()}
                        </Col>
                    </Row>

                    <Row className="d-flex flex-md-row flex-column gap-3">
                        <Col>
                            <Button
                                variant="success"
                                className="w-100 py-3 fw-bold fs-5"
                                onClick={onSubmit}
                                disabled={loading || !podeEnviar}
                            >
                                Finalizar Avaliação Científica
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button
                                onClick={() => navigate(-1)}
                                variant="secondary"
                                className="d-flex text-center justify-content-center align-items-center gap-2 py-3 w-100 fw-bold"
                            >
                                <MdArrowBack /> Voltar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            {alerta && (
                <Alerta
                    key={alerta.reacao}
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    duracao={alerta.duracao}
                    reacao={alerta.reacao}
                />
            )}
            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
