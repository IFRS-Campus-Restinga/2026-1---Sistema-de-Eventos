import React, { useEffect, useMemo, useState } from 'react';
import { Container, Spinner, Button, Row, Col } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import useInscricoesEvento from '../hooks/useInscricoesEvento';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';
import Alerta from '../components/common/Alerta';
import {
    marcarPresencaInscricaoEvento,
    retirarPresencaInscricaoEvento,
} from '../services/inscricaoEventoService';

const ITENS_POR_PAGINA = 20;

export default function ListarInscritosEvento() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const navegate = useNavigate();
    const eventoInicial = String(
        location.state?.eventoId || searchParams.get('eventoId') || '',
    );

    const { inscricoes, loading, error, setEventoId, carregarInscricoes } =
        useInscricoesEvento(eventoInicial);

    const [paginaAtual, setPaginaAtual] = useState(0);
    const [presencasRegistradas, setPresencasRegistradas] = useState(new Set());
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });
    const [search, setSearch] = useState('');

    const mostrarAlerta = (mensagem, variacao = 'danger') => {
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: prev.reacao + 1,
        }));
    };

    useEffect(() => {
        if (eventoInicial) {
            setEventoId(eventoInicial);
        }
    }, [eventoInicial, setEventoId]);

    useEffect(() => {
        const novasPresencas = new Set(
            inscricoes
                .filter((item) => Boolean(item.presente))
                .map((item) => item.id),
        );
        setPresencasRegistradas(novasPresencas);
    }, [inscricoes]);

    const inscritosMapeados = useMemo(
        () =>
            inscricoes.map((inscricao, index) => ({
                id: inscricao.id,
                nome:
                    inscricao.perfil_usuario_nome ||
                    `Usuário ${inscricao.perfil_usuario_id || index + 1}`,
                cpf: inscricao.perfil_usuario_cpf
                    ? String(inscricao.perfil_usuario_cpf)
                    : inscricao.perfil_usuario_id
                      ? String(inscricao.perfil_usuario_id)
                      : '-',
                email: inscricao.perfil_usuario_email || '-',
                inscricaoOriginal: inscricao,
            })),
        [inscricoes],
    );

    // muito mais simples, fé
    const inscritosFiltrados = useMemo(() => {
        const s = (search || '').trim().toLowerCase();
        if (!s) return inscritosMapeados;
        const digits = s.replace(/\D/g, '');
        return inscritosMapeados.filter((u) => {
            if (u.nome && u.nome.toLowerCase().includes(s)) return true;
            if (u.email && u.email.toLowerCase().includes(s)) return true;
            if (digits && u.cpf && u.cpf.replace(/\D/g, '').includes(digits))
                return true;
            return false;
        });
    }, [inscritosMapeados, search]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(inscritosFiltrados.length / ITENS_POR_PAGINA),
    );

    const usuariosPagina = useMemo(() => {
        const inicio = paginaAtual * ITENS_POR_PAGINA;
        return inscritosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
    }, [inscritosFiltrados, paginaAtual]);

    useEffect(() => {
        if (paginaAtual > totalPaginas - 1) {
            setPaginaAtual(Math.max(totalPaginas - 1, 0));
        }
    }, [paginaAtual, totalPaginas]);

    useEffect(() => {
        setPaginaAtual(0);
    }, [search]);

    const paginaAnterior = () => {
        setPaginaAtual((prev) => Math.max(prev - 1, 0));
    };

    const proximaPagina = () => {
        setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas - 1));
    };

    const registrarPresenca = async (usuario) => {
        try {
            await marcarPresencaInscricaoEvento(usuario.inscricaoOriginal);

            setPresencasRegistradas((prev) => {
                const novoSet = new Set(prev);
                novoSet.add(usuario.id);
                return novoSet;
            });

            await carregarInscricoes(eventoInicial);
            mostrarAlerta(
                `Presença registrada para ${usuario.nome}.`,
                'success',
            );
        } catch (erro) {
            mostrarAlerta(
                erro?.response?.data?.erro ||
                    erro?.response?.data?.mensagem ||
                    'Não foi possível registrar presença.',
            );
        }
    };

    const retirarPresenca = async (usuario) => {
        try {
            await retirarPresencaInscricaoEvento(usuario.inscricaoOriginal);

            setPresencasRegistradas((prev) => {
                const novoSet = new Set(prev);
                novoSet.delete(usuario.id);
                return novoSet;
            });

            await carregarInscricoes(eventoInicial);
            mostrarAlerta(`Presença retirada para ${usuario.nome}.`, 'warning');
        } catch (erro) {
            mostrarAlerta(
                erro?.response?.data?.erro ||
                    erro?.response?.data?.mensagem ||
                    'Não foi possível retirar presença.',
            );
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" ">
                <Container fluid className="p-0">
                    {alerta.mensagem && (
                        <Alerta
                            mensagem={alerta.mensagem}
                            variacao={alerta.variacao}
                            reacao={alerta.reacao}
                        />
                    )}

                    {error && (
                        <div className="alert alert-danger mb-4" role="alert">
                            {error?.response?.data?.erro ||
                                error?.message ||
                                'Erro ao carregar inscritos.'}
                        </div>
                    )}

                    <div
                        className="w-100 p-0"
                        style={{
                            backgroundImage:
                                ' linear-gradient(to right, rgb(23, 136, 44) 0px, rgb(0, 81, 15) 100%)',
                        }}
                    >
                        <div className="text-center text-white pb-4 d-flex flex-column  align-items-center m-0">
                            <h1 className="fw-bold mt-4">Lista de Inscritos</h1>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3 my-3 w-75 mx-auto">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Buscar por nome, CPF ou email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <Button
                            variant="secondary"
                            className="fw-bold text-white text-decoration-none flex-shrink-0"
                            onClick={() => navegate(-1)}
                        >
                            Voltar
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="text-muted mt-3 mb-0">
                                Carregando inscritos...
                            </p>
                        </div>
                    ) : (
                        <div className="px-5">
                            <ListaInscritos
                                titulo=""
                                usuarios={usuariosPagina}
                                habilitarPresenca={true}
                                onRegistrarPresenca={registrarPresenca}
                                onRetirarPresenca={retirarPresenca}
                                // onVoltar={() => navigate(-1)}
                                colunasVisiveis={[
                                    'usuario',
                                    'cpf',
                                    'email',
                                    'acoes',
                                ]}
                                paginaAnterior={paginaAnterior}
                                proximaPagina={proximaPagina}
                                paginaAtual={paginaAtual}
                                totalPaginas={totalPaginas}
                                presencasRegistradas={presencasRegistradas}
                            />
                        </div>
                    )}
                </Container>
            </main>

            <Footer
                telefone="(51) 3333-1234"
                endereco="Rua Alberto Hoffmann, 285"
                ano={2026}
                campus="Campus Restinga"
            />
        </div>
    );
}
