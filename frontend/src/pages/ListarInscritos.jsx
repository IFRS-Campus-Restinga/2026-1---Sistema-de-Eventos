import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';
import Alerta from '../components/common/Alerta';
import useInscricoesAtracao from '../hooks/useInscricoesAtracao';
import { listarAtracoes, buscarUsuarios } from '../services/atracaoService';

const ITENS_POR_PAGINA = 10;

export default function ListarInscritos() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const inscritosIniciais = location.state?.inscritos ?? [];
    const atracaoIdInicial =
        location.state?.atracaoId || searchParams.get('atracaoId') || '';

    const {
        inscricoes,
        loading,
        error,
        setAtracaoId,
    } = useInscricoesAtracao(atracaoIdInicial);

    const [inscritos, setInscritos] = useState(inscritosIniciais);
    const [atracoes, setAtracoes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [presencasRegistradas, setPresencasRegistradas] = useState(new Set());
    const [alerta, setAlerta] = useState({
        mensagem: '',
        variacao: 'danger',
        reacao: 0,
    });

    const mostrarAlerta = (mensagem, variacao = 'danger') =>
        setAlerta((prev) => ({
            ...prev,
            mensagem,
            variacao,
            reacao: (prev.reacao || 0) + 1,
        }));

        useEffect(() => {
            setAtracaoId(atracaoIdInicial || '');
        }, [atracaoIdInicial, setAtracaoId]);

        useEffect(() => {
            async function carregarDadosAuxiliares() {
                try {
                    const [dadosAtracoes, dadosUsuarios] = await Promise.all([
                        listarAtracoes(),
                        buscarUsuarios(),
                    ]);
                    setAtracoes(Array.isArray(dadosAtracoes) ? dadosAtracoes : []);
                    setUsuarios(Array.isArray(dadosUsuarios) ? dadosUsuarios : []);
                } catch {
                    mostrarAlerta(
                        'Não foi possível carregar dados auxiliares dos inscritos.',
                    );
                }
            }

            carregarDadosAuxiliares();
        }, []);

        useEffect(() => {
            if (inscritosIniciais.length > 0) {
                return;
            }

            const usuariosPorId = new Map(
                usuarios.map((usuario) => [Number(usuario.id), usuario]),
            );
            const atracoesPorId = new Map(
                atracoes.map((atracao) => [Number(atracao.id), atracao]),
            );

            const inscritosMapeados = inscricoes.map((inscricao) => {
                const usuario = usuariosPorId.get(Number(inscricao.perfil_usuario_id));
                const atracao = atracoesPorId.get(Number(inscricao.atracao_id));

                return {
                    id: inscricao.id,
                    nome: usuario?.nome || `Usuário ${inscricao.perfil_usuario_id}`,
                    cpf: usuario?.cpf || '',
                    email: usuario?.email || '',
                    atracao: atracao?.titulo || `Atração ${inscricao.atracao_id}`,
                    tipo: inscricao.status || 'Inscrito',
                    presente: Boolean(inscricao.presente),
                };
            });

            setInscritos(inscritosMapeados);
        }, [inscricoes, usuarios, atracoes, inscritosIniciais.length]);

        useEffect(() => {
            if (!error) return;
            mostrarAlerta('Não foi possível carregar inscritos da atração.');
        }, [error]);

    const totalPaginas = Math.max(1, Math.ceil(inscritos.length / ITENS_POR_PAGINA));

    const usuariosPagina = useMemo(() => {
        const inicio = paginaAtual * ITENS_POR_PAGINA;
        const fim = inicio + ITENS_POR_PAGINA;
        return inscritos.slice(inicio, fim);
    }, [inscritos, paginaAtual]);

    const registrarPresenca = (usuario) => {
        setPresencasRegistradas((prev) => {
            const novoSet = new Set(prev);
            novoSet.add(usuario.id);
            return novoSet;
        });
        mostrarAlerta(`Presença registrada para ${usuario.nome}.`, 'success');
    };

    const excluirInscrito = (usuario) => {
        setInscritos((prev) => prev.filter((item) => item.id !== usuario.id));
        mostrarAlerta('Inscrito removido da listagem.', 'success');
    };

    const paginaAnterior = () => {
        setPaginaAtual((prev) => Math.max(prev - 1, 0));
    };

    const proximaPagina = () => {
        setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas - 1));
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="flex-fill bg-light py-4">
                {alerta.mensagem && (
                    <Alerta
                        mensagem={alerta.mensagem}
                        variacao={alerta.variacao}
                        reacao={alerta.reacao}
                    />
                )}
                <ListaInscritos
                    titulo="Lista de Inscritos da Atração"
                    usuarios={usuariosPagina}
                    habilitarPresenca={true}
                    onRegistrarPresenca={registrarPresenca}
                    onExcluir={excluirInscrito}
                    onVoltar={() => window.history.back()}
                    paginaAnterior={paginaAnterior}
                    proximaPagina={proximaPagina}
                    paginaAtual={paginaAtual}
                    totalPaginas={totalPaginas}
                    presencasRegistradas={presencasRegistradas}
                />
                {loading && (
                    <p className="text-center text-muted">Carregando inscritos...</p>
                )}
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