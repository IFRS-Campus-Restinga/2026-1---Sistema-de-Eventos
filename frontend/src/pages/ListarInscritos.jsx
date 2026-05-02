import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import ListaInscritos from '../components/lista_inscritos/ListaInscritos';
import Alerta from '../components/common/Alerta';

const ITENS_POR_PAGINA = 10;

export default function ListarInscritos() {
    const location = useLocation();
    const inscritosIniciais = location.state?.inscritos ?? [];
    const [inscritos, setInscritos] = useState(inscritosIniciais);
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