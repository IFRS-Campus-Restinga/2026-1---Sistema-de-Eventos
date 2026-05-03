import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

import { MdArrowBack, MdSave, MdPublish } from 'react-icons/md';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Card from '../components/common/Card';
import Alerta from '../components/common/Alerta';

import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

export default function SessaoBoard({ campus = 'Campus Restinga' }) {
    const navigate = useNavigate();

    // MOCK DE DADOS
    const [atracoesNaoAlocadas, setAtracoesNaoAlocadas] = useState([
        {
            id: 999,
            titulo: 'Nova atração teste 1',
            autor: 'Maria Souza',
        },
        {
            id: 998,
            titulo: 'Nova atração teste 2',
            autor: 'Carlos Lima',
        },
    ]);

    const [dataSelecionada, setDataSelecionada] = useState('2025-11-25');
    const [espacos, setEspacos] = useState([
        {
            id: 1,
            nome: 'Sala 101',
            capacidade: 50,
            sessoes: [
                {
                    id: 10,
                    data_horario_inicio: '08:00',
                    data_horario_fim: '10:30',
                    ordem_apresentacoes: [
                        {
                            id: 10,
                            horario_inicio: '08:00',
                            horario_fim: '08:30',
                            ordem: 1,
                            atracao: {
                                id: 1,
                                titulo: 'Abertura da Sessão',
                                autor: 'Diretoria',
                            },
                        },
                        {
                            id: 11,
                            horario_inicio: '08:30',
                            horario_fim: '09:00',
                            ordem: 2,
                            atracao: {
                                id: 10,
                                titulo: 'Vida marinha: uma narrativa',
                                autor: 'João da Silva',
                            },
                        },
                    ],
                },
            ],
        },
        {
            id: 2,
            nome: 'Sala 102 (Lab. Info)',
            capacidade: 30,
            sessoes: [
                {
                    id: 20,
                    data_horario_inicio: '08:00',
                    data_horario_fim: '10:30',
                    ordem_apresentacoes: [
                        {
                            id: 20,
                            horario_inicio: '08:00',
                            horario_fim: '08:30',
                            ordem: 1,
                            atracao: {
                                id: 22,
                                titulo: 'Oficina de teatro',
                                autor: 'NEABI',
                            },
                        },
                        {
                            id: 21,
                            horario_inicio: '08:30',
                            horario_fim: '09:00',
                            ordem: 2,
                            atracao: {
                                id: 220,
                                titulo: 'Tudo sobre Python',
                                autor: 'Jean Oliveira',
                            },
                        },
                    ],
                },
            ],
        },
    ]);

    // MOCK DE ALERTAS
    const [message] = useState(null);
    const [error] = useState(null);

    // Para mover cards entre as colunas
    /*
    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        const apresentacaoId = active.id;
        const novoEspacoId = parseInt(
            over.id.toString().replace('espaco-', ''),
        );

        let apresentacaoMovida;

        const novosEspacos = espacos.map((espaco) => {
            return {
                ...espaco,
                sessoes: espaco.sessoes.map((sessao) => {
                    const encontrada = sessao.ordem_apresentacoes.find(
                        (a) => a.id === apresentacaoId,
                    );

                    if (encontrada) {
                        apresentacaoMovida = encontrada;

                        return {
                            ...sessao,
                            ordem_apresentacoes:
                                sessao.ordem_apresentacoes.filter(
                                    (a) => a.id !== apresentacaoId,
                                ),
                        };
                    }

                    return sessao;
                }),
            };
        });

        const resultado = novosEspacos.map((espaco) => {
            if (espaco.id === novoEspacoId) {
                return {
                    ...espaco,
                    sessoes: [
                        {
                            ...espaco.sessoes[0], // simplificação: 1 sessão por espaço
                            ordem_apresentacoes: [
                                ...espaco.sessoes[0].ordem_apresentacoes,
                                apresentacaoMovida,
                            ],
                        },
                    ],
                };
            }
            return espaco;
        });

        setEspacos(resultado);
    }
    */

    // tornar arratavel para todos os casos
    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        const overId = over.id.toString();

        // DROP só funciona em espaço
        if (!overId.startsWith('espaco-')) return;

        const novoEspacoId = parseInt(overId.replace('espaco-', ''));

        // 👉 CASO 1: veio da lista (não alocada)
        if (active.id.toString().startsWith('livre-')) {
            const atracaoId = parseInt(active.id.replace('livre-', ''));

            const atracao = atracoesNaoAlocadas.find((a) => a.id === atracaoId);

            if (!atracao) return;

            const novaApresentacao = {
                id: Date.now(), // mock id
                horario_inicio: '00:00',
                horario_fim: '00:00',
                ordem: 999,
                atracao,
            };

            const novosEspacos = espacos.map((espaco) => {
                if (espaco.id === novoEspacoId) {
                    return {
                        ...espaco,
                        sessoes: [
                            {
                                ...espaco.sessoes[0],
                                ordem_apresentacoes: [
                                    ...espaco.sessoes[0].ordem_apresentacoes,
                                    novaApresentacao,
                                ],
                            },
                        ],
                    };
                }
                return espaco;
            });

            setEspacos(novosEspacos);

            // remove da lista da esquerda
            setAtracoesNaoAlocadas((prev) =>
                prev.filter((a) => a.id !== atracaoId),
            );

            return;
        }

        // 👉 CASO 2: mover entre espaços (seu código atual)
        const apresentacaoId = active.id;

        let apresentacaoMovida;

        const novosEspacos = espacos.map((espaco) => ({
            ...espaco,
            sessoes: espaco.sessoes.map((sessao) => {
                const encontrada = sessao.ordem_apresentacoes.find(
                    (a) => a.id === apresentacaoId,
                );

                if (encontrada) {
                    apresentacaoMovida = encontrada;

                    return {
                        ...sessao,
                        ordem_apresentacoes: sessao.ordem_apresentacoes.filter(
                            (a) => a.id !== apresentacaoId,
                        ),
                    };
                }

                return sessao;
            }),
        }));

        const resultado = novosEspacos.map((espaco) => {
            if (espaco.id === novoEspacoId) {
                return {
                    ...espaco,
                    sessoes: [
                        {
                            ...espaco.sessoes[0],
                            ordem_apresentacoes: [
                                ...espaco.sessoes[0].ordem_apresentacoes,
                                apresentacaoMovida,
                            ],
                        },
                    ],
                };
            }
            return espaco;
        });

        setEspacos(resultado);
    }

    // Card atração arrastável
    function AtracaoArrastavel({ ordem_apresentacoes }) {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: ordem_apresentacoes.id,
        });

        const style = {
            transform: transform
                ? `translate(${transform.x}px, ${transform.y}px)`
                : undefined,
            cursor: 'grab',
        };

        return (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                <Card
                    className="mb-2"
                    style={{
                        borderLeft: '6px solid #198754',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        backgroundColor: ordem_apresentacoes.erro
                            ? '#ffe6e6'
                            : '',
                    }}
                >
                    <small className="text-muted">
                        {ordem_apresentacoes.horario_inicio} -{' '}
                        {ordem_apresentacoes.horario_fim}
                    </small>

                    <h6>{ordem_apresentacoes.atracao.titulo}</h6>

                    <small>{ordem_apresentacoes.atracao.autor}</small>
                </Card>
            </div>
        );
    }

    // Card arrastável para atrações não alocadas
    function AtracaoLivreDrag({ atracao }) {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: atracao.id,
        });

        const style = {
            transform: transform
                ? `translate(${transform.x}px, ${transform.y}px)`
                : undefined,
            cursor: 'grab',
        };

        return (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                <Card corBorda="#198754">
                    <small className="text-muted">#{atracao.id}</small>

                    <div style={{ fontWeight: '500' }}>{atracao.titulo}</div>

                    <small>{atracao.autor}</small>
                </Card>
            </div>
        );
    }

    // Colunas do quadro(espaço)
    function EspacoDrop({ espaco, children }) {
        const { setNodeRef } = useDroppable({
            id: espaco.id,
        });

        return (
            <div ref={setNodeRef} className="p-2 border rounded bg-light h-100">
                {children}
            </div>
        );
    }

    return (
        <>
            <NavBar />

            <main className="flex-fill">
                <Container className="mx-auto">
                    {/* Menu de datas */}
                    {/* PUXARA AS DATAS DE EXECUÇÃO DO EVENTO- FICARÁ AQUI! */}
                    <Row className="mx-auto my-4 align-items-center">
                        <Col md={4}>
                            <Form.Select
                                value={dataSelecionada}
                                onChange={(e) =>
                                    setDataSelecionada(e.target.value)
                                }
                            >
                                <option value="2025-11-25">
                                    Dia 25/11 (Manhã)
                                </option>
                                <option value="2025-11-26">Dia 26/11</option>
                            </Form.Select>
                        </Col>

                        {/* Botões de ação */}
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                className="fw-bold"
                            >
                                <MdSave className="me-1" />
                                Salvar rascunho
                            </Button>

                            <Button variant="primary" className="fw-bold">
                                <MdPublish className="me-1" />
                                Publicar Agenda
                            </Button>
                        </Col>
                    </Row>

                    {/* teste*/}
                    <Row className="g-3">
                        {/* COLUNA ESQUERDA */}
                        <Col md={3}>
                            <div className="p-2 border rounded bg-white h-100">
                                {/* CONTADOR DE ATRAÇÕES NÃO ALOCADAS */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong style={{ fontSize: '12px' }}>
                                        AGUARDANDO ALOCAÇÃO (12)
                                    </strong>
                                </div>

                                {/* BUSCA */}
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Buscar por títulos..."
                                    className="mb-2"
                                />

                                {/* LISTA */}
                                <div
                                    style={{
                                        maxHeight: '60vh',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {atracoesNaoAlocadas.map((atracao) => (
                                        <AtracaoLivreDrag
                                            key={atracao.id}
                                            atracao={atracao}
                                        />
                                    ))}
                                </div>

                                {/* BOTÃO */}
                                <Button
                                    className="w-100 mt-2 fw-bold"
                                    style={{
                                        backgroundColor: '#0d6efd',
                                        border: 'none',
                                    }}
                                >
                                    + Adicionar Espaço
                                </Button>
                            </div>
                        </Col>

                        {/* COLUNAS DE ESPAÇO */}
                        <Col md={9}>
                            <Row className="g-3">
                                {espacos.map((espaco) => (
                                    <Col key={espaco.id} md={4}>
                                        <EspacoDrop espaco={espaco}>
                                            {/* conteúdo igual */}
                                        </EspacoDrop>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>

                    {/* Quadro de espaços */}
                    <DndContext onDragEnd={handleDragEnd}>
                        <Row className="g-3">
                            {espacos.map((espaco) => (
                                <Col key={espaco.id} md={4}>
                                    <EspacoDrop espaco={espaco.id} md={4}>
                                        {/* HEADER DA SALA */}
                                        <div
                                            className="p-2 rounded text-white mb-2"
                                            style={{
                                                backgroundColor: '#198754',
                                            }}
                                        >
                                            <strong>{espaco.nome}</strong>
                                            <br />
                                            <small>
                                                Capacidade: {espaco.capacidade}
                                            </small>
                                        </div>

                                        {/* Cards */}
                                        {espaco.sessoes.map((sessao) =>
                                            sessao.ordem_apresentacoes.map(
                                                (ordem_apresentacao) => (
                                                    <AtracaoArrastavel
                                                        key={
                                                            ordem_apresentacao.id
                                                        }
                                                        ordem_apresentacoes={
                                                            ordem_apresentacao
                                                        }
                                                    />
                                                ),
                                            ),
                                        )}

                                        {/* Drop area */}
                                        <div
                                            className="mt-2 text-center"
                                            style={{
                                                border: '2px dashed #ccc',
                                                padding: '10px',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            Arraste aqui
                                        </div>
                                    </EspacoDrop>
                                </Col>
                            ))}
                        </Row>
                    </DndContext>

                    {/* Botão de voltar */}
                    <Row className="my-4">
                        <Col className="d-flex justify-content-end">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="fw-bold"
                                onClick={() => navigate('/dashboard')}
                            >
                                <MdArrowBack className="me-2" />
                                Voltar
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>

            {/* ALERTAS MOCK */}
            {message && (
                <Alerta mensagem={message} variacao="success" duracao={5000} />
            )}

            {error && (
                <Alerta mensagem={error} variacao="danger" duracao={5000} />
            )}
            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </>
    );
}
