import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Tag from '../components/common/Tag';
import { obterCorPorTag } from '../utils/themeTags';
import formatNivelEnsino from '../utils/formatNivelEnsino';
import formatAreaConhecimento from '../utils/formatAreaConhecimento';
import Alerta from '../components/common/Alerta';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import useAvaliarAtracao from '../hooks/useAvaliarAtracao';

export default function AvaliarAtracao() {
    const navigate = useNavigate();
    const [alerta, setAlerta] = useState(null);

    const params = new URLSearchParams(window.location.search);
    const atracaoId = params.get('atracao_id');
    const avaliacaoIdParam = params.get('avaliacao_id');

    const {
        atracao,
        criterios,
        itens,
        parecer,
        setParecer,
        destaque,
        setDestaque,
        compareceu,
        setCompareceu,
        loading,
        avaliacaoId,
        setAvaliacaoId,
        editingAllowed,
        handleNotaChange,
        handleSubmit,
        podeEnviar,
    } = useAvaliarAtracao({ atracaoId, avaliacaoId: avaliacaoIdParam });

    const onSubmit = async () => {
        if (!atracao) return;
        try {
            const res = await handleSubmit();
            if (res && res.success) {
                const redirectTimeout = 2000; // ms
                setAlerta({
                    mensagem: 'Avaliação salva com sucesso',
                    variacao: 'success',
                    duracao: redirectTimeout,
                    reacao: Date.now(),
                });
                setTimeout(
                    () =>
                        navigate(
                            `/minhas_avaliacoes?evento_id=${atracao.evento}`,
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
        } catch (err) {
            console.error(err);
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

            <main className=" py-4 px-3 ">
                <Container className="px-5 py-4  d-flex flex-column gap-3 shadow rounded-4 gap-3">
                    <Row>
                        <Col className="px-0">
                            <h1>
                                {atracao ? atracao.titulo : 'Carregando...'}
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="px-0 d-flex flex-wrap gap-2">
                            <Tag
                                corTexto="#fff"
                                corFundo="#000"
                                texto={
                                    formatNivelEnsino(atracao?.nivel_ensino) ||
                                    'Nível'
                                }
                            />
                            <Tag
                                corTexto="#fff"
                                corFundo={obterCorPorTag(
                                    formatAreaConhecimento(
                                        atracao?.area_conhecimento,
                                    ),
                                )}
                                texto={
                                    formatAreaConhecimento(
                                        atracao?.area_conhecimento,
                                    ) || 'Área'
                                }
                            />
                            <Tag
                                corTexto="#fff"
                                corFundo={obterCorPorTag(atracao?.tipo)}
                                texto={atracao?.tipo || 'Modalidade'}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col
                            className="rounded-2 fw-semibold  p-3"
                            style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                            }}
                        >
                            Atribua notas de 0 a 10 utilizando ponto para
                            decimais (ex: 8,5)
                        </Col>
                    </Row>

                    {(criterios || []).map((c, idx) => (
                        <Row
                            key={c.id}
                            className="p-3 rounded-4 avaliar-criterio-card"
                        >
                            <Col className="d-md-flex justify-content-between ">
                                <Row className="d-flex flex-column gap-3">
                                    <Col>
                                        <span className="fw-bold fs-4">{`${
                                            idx + 1
                                        }. ${c.nome}`}</span>
                                    </Col>
                                    <Col>
                                        <span>{c.descricao}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <input
                                            max={10}
                                            min={0}
                                            step={0.1}
                                            value={itens[idx]?.nota ?? ''}
                                            onChange={(e) =>
                                                handleNotaChange(
                                                    idx,
                                                    e.target.value,
                                                )
                                            }
                                            type="number"
                                            className="score-input fs-4 fw-bold w-100 mt-3 mt-md-0"
                                            disabled={!editingAllowed}
                                            required
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    ))}

                    <Row className="d-flex flex-column gap-2">
                        <Col className="px-0">
                            <label htmlFor="parecer" className="fw-bold fs-5">
                                Parecer Descritivo
                            </label>
                        </Col>
                        <Col className="w-100 px-0">
                            <textarea
                                name="parecer"
                                id="parecer"
                                placeholder="Escreva seus comentários sobre o trabalho..."
                                rows={5}
                                className="avaliar-criterio-card w-100 px-3"
                                value={parecer}
                                onChange={(e) => setParecer(e.target.value)}
                                disabled={!editingAllowed}
                                required
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="d-flex flex-column flex-md-row justify-content-start px-0 fw-semibold">
                            <div
                                className="p-2 rounded-3"
                                style={{
                                    background: '#fffbeb',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                }}
                            >
                                <Form.Check
                                    type="switch"
                                    id="destaque-switch"
                                    label="Indicar trabalho como destaque?"
                                    checked={destaque}
                                    onChange={(e) =>
                                        setDestaque(e.target.checked)
                                    }
                                    disabled={!editingAllowed}
                                />
                            </div>
                            <div
                                className="p-2 rounded-3 mt-md-0 mt-3"
                                style={{
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                }}
                            >
                                <Form.Check
                                    type="checkbox"
                                    id="compareceu"
                                    label="Compareceu"
                                    checked={compareceu}
                                    onChange={(e) =>
                                        setCompareceu(e.target.checked)
                                    }
                                    disabled={!editingAllowed}
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row className="d-flex flex-column justify-content-center text-center">
                        <Col>NOTA FINAL CALCULADA</Col>
                        <Col className="fw-bold fs-1 text-primary">
                            {(() => {
                                const vals = (itens || [])
                                    .map((i) => i.nota)
                                    .filter((n) => Number.isFinite(n));
                                if (!vals || vals.length === 0) return '--';
                                const avg =
                                    vals.reduce((a, b) => a + b, 0) /
                                    vals.length;
                                return avg.toFixed(1).replace('.', ',');
                            })()}
                        </Col>
                    </Row>

                    <Row className="d-flex flex-md-row flex-column gap-3">
                        <Col>
                            <Button
                                variant="primary"
                                className="w-100 py-3"
                                onClick={onSubmit}
                                disabled={loading || !podeEnviar}
                            >
                                Finalizar Avaliação
                            </Button>
                        </Col>
                        <Col className="">
                            <Button
                                onClick={() => navigate(-1)}
                                variant="secondary"
                                className="d-flex text-center justify-content-center align-items-center gap-2 px-4 py-3 w-100"
                            >
                                <MdArrowBack /> Voltar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>
            {alerta && (
                <Alerta
                    key={alerta.reacao ?? Date.now()}
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    duracao={alerta.duracao ?? 5000}
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
