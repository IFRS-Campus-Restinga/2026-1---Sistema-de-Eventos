import React, { useEffect, useMemo, useState } from 'react';
import { Container, Spinner, Button } from 'react-bootstrap';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import useInscricoesEvento from '../hooks/useInscricoesEvento';
import useInscricoesAtracao from '../hooks/useInscricoesAtracao';
import { listarAtracoes, buscarUsuarios } from '../services/atracaoService';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';
import Alerta from '../components/common/Alerta';
import {
    marcarPresencaInscricaoEvento,
    retirarPresencaInscricaoEvento,
} from '../services/inscricaoEventoService';
import {
    marcarPresencaInscricaoAtracao,
    retirarPresencaInscricaoAtracao,
} from '../services/inscricaoAtracaoService';

const ITENS_POR_PAGINA = 20;

export default function ListarInscritosEvento() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const navegate = useNavigate();
    const atracaoInicial = String(
        location.state?.atracaoId || searchParams.get('atracaoId') || '',
    );

    const { inscricoes, loading, error, setAtracaoId, carregarInscricoes } =
        useInscricoesAtracao(atracaoInicial);

    const [atracoes, setAtracoes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

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
        if (atracaoInicial) {
            setAtracaoId(atracaoInicial);
        }
    }, [atracaoInicial, setAtracaoId]);

    useEffect(() => {
        async function carregarDadosAuxiliares() {
            try {
                const [dadosAtracoes, dadosUsuarios] = await Promise.all([
                    listarAtracoes(),
                    buscarUsuarios(),
                ]);
                setAtracoes(Array.isArray(dadosAtracoes) ? dadosAtracoes : []);
                setUsuarios(Array.isArray(dadosUsuarios) ? dadosUsuarios : []);
            } catch (e) {
                // não bloqueante
            }
        }

        carregarDadosAuxiliares();
    }, []);

    useEffect(() => {
        const novasPresencas = new Set(
            inscricoes
                .filter((item) => Boolean(item.presente))
                .map((item) => item.id),
        );
        setPresencasRegistradas(novasPresencas);
    }, [inscricoes]);

    const inscritosMapeados = useMemo(() => {
        const usuariosPorId = new Map(
            usuarios.map((usuario) => [Number(usuario.id), usuario]),
        );

        return inscricoes.map((inscricao, index) => {
            const usuario = usuariosPorId.get(
                Number(inscricao.perfil_usuario_id),
            );
            return {
                id: inscricao.id,
                nome:
                    usuario?.nome ||
                    `Usuário ${inscricao.perfil_usuario_id || index + 1}`,
                cpf:
                    usuario?.cpf ||
                    (inscricao.perfil_usuario_id
                        ? String(inscricao.perfil_usuario_id)
                        : '-'),
                email: usuario?.email || '-',
                inscricaoOriginal: inscricao,
            };
        });
    }, [inscricoes, usuarios]);

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
            await marcarPresencaInscricaoAtracao(usuario.inscricaoOriginal);

            setPresencasRegistradas((prev) => {
                const novoSet = new Set(prev);
                novoSet.add(usuario.id);
                return novoSet;
            });

            await carregarInscricoes(atracaoInicial);
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
            await retirarPresencaInscricaoAtracao(usuario.inscricaoOriginal);

            setPresencasRegistradas((prev) => {
                const novoSet = new Set(prev);
                novoSet.delete(usuario.id);
                return novoSet;
            });

            await carregarInscricoes(atracaoInicial);
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

            <main className="flex-fill py-4">
                <Container>
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

                    <h1 className="mb-5 text-center">Lista de Inscritos</h1>
                    <div className="d-flex align-items-center gap-3 mb-3 w-75 mx-auto">
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
                        <ListaInscritos
                            titulo=""
                            usuarios={usuariosPagina}
                            habilitarPresenca={true}
                            onRegistrarPresenca={registrarPresenca}
                            onRetirarPresenca={retirarPresenca}
                            // onVoltar={() => navigate(-1)}cer
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
