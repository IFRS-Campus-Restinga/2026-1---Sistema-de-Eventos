import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta';
import FiltroAvaliadores from '../components/gerenciar_avaliadores/FiltroAvaliadores';
import TabelaAtibuicao from '../components/gerenciar_avaliadores/TabelaAtribuicao';
import ModalAtribuicao from '../components/gerenciar_avaliadores/ModalAtribuicao';
import ModalDetalhesAvaliacao from '../components/gerenciar_avaliadores/ModalDetalhesAvaliacao';
import useGerenciarAvaliadoresAtracoes from '../hooks/useGerenciarAvaliadoresAtracoes';

export default function GerenciarAvaliacoesAtracoes({}) {
    const [searchParams] = useSearchParams();
    const eventoId = searchParams.get('evento_id');
    const {
        alerta,
        atracoes,
        isMobile,
        filtroArea,
        filtroBusca,
        areaOptions,
        filtroModalidade,
        setFiltroModalidade,
        opcoesModalidade,
        ordenarOpcoes,
        valorOrdenacao,
        setFiltroArea,
        setFiltroBusca,
        onOrdenacaoChange,
        aoFiltrar,
        modalidadesMap,
        avaliacoesMap,
        destaquesMap,
        criteriosMap,
        avaliadoresContagemMap,
        abrirAvaliacao,
        fecharAvaliacao,
        removerAvaliadorDaTabela,
        abrirModalAtribuicao,
        exibirModal,
        selecionada,
        sugestoes,
        usuarios,
        manualBusca,
        setManualBusca,
        selecionadasSugestoes,
        toggleSelecao,
        onBuscarUsuarios,
        salvarAtribuicoes,
        fecharModalAtribuicao,
        avaliacaoModal,
        eventosMap,
    } = useGerenciarAvaliadoresAtracoes(eventoId);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className=" ">
                <Container
                    fluid
                    className="d-md-flex flex-md-column align-items-md-center gap-3 p-0"
                >
                    <Row
                        className="w-100 p-0"
                        style={{
                            backgroundImage:
                                ' linear-gradient(to right, rgb(23, 136, 44) 0px, rgb(0, 81, 15) 100%)',
                        }}
                    >
                        <Col className="text-center text-white pb-4 d-flex flex-column my-3 align-items-center">
                            <h1 className="fw-bold">Gerenciar Avaliadores</h1>
                            <span
                                className="align-items-center gap-2 rounded-pill fw-bold text-uppercase my-2"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: 'rgba(255, 255, 255, 0.76)',
                                    fontSize: '0.74rem',
                                    letterSpacing: '0.18em',
                                    padding: '0.45rem 0.85rem',
                                }}
                            >
                                AtraçÕes
                            </span>
                            <span className="fs-5">
                                Gerencie AtraçÕes e distribua avaliadores
                            </span>
                        </Col>
                    </Row>
                    <Row className={`${!isMobile ? 'w-75' : 'w-100'}`}>
                        <Col>
                            <FiltroAvaliadores
                                filtroBusca={filtroBusca}
                                onBuscaChange={(e) =>
                                    setFiltroBusca(e.target.value)
                                }
                                filtroArea={filtroArea}
                                onAreaChange={(e) =>
                                    setFiltroArea(e.target.value)
                                }
                                filtroModalidade={filtroModalidade}
                                onModalidadeChange={(e) =>
                                    setFiltroModalidade(e.target.value)
                                }
                                opcoesModalidade={opcoesModalidade}
                                areaOptions={areaOptions}
                                ordenarOpcoes={ordenarOpcoes}
                                valorOrdenacao={valorOrdenacao}
                                onOrdenacaoChange={(e) =>
                                    onOrdenacaoChange(e.target.value)
                                }
                                aoFiltrar={aoFiltrar}
                            />
                        </Col>
                    </Row>
                    <Row
                        className={`${
                            !isMobile
                                ? 'w-75 overflow-auto'
                                : 'w-100 overflow-auto'
                        } pb-5`}
                    >
                        <Col>
                            <TabelaAtibuicao
                                trabalhos={atracoes}
                                modalidadesMap={modalidadesMap}
                                avaliacoesMap={avaliacoesMap}
                                destaquesMap={destaquesMap}
                                eventosMap={eventosMap}
                                onAbrirAvaliacao={abrirAvaliacao}
                                onRemoverAvaliador={removerAvaliadorDaTabela}
                                onAtribuir={abrirModalAtribuicao}
                                destaque={true}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>
            <ModalAtribuicao
                show={exibirModal}
                selecionada={selecionada}
                manualBusca={manualBusca}
                onManualBuscaChange={setManualBusca}
                onBuscarUsuarios={onBuscarUsuarios}
                sugestoes={sugestoes}
                usuarios={usuarios}
                selecionadasSugestoes={selecionadasSugestoes}
                toggleSelecao={toggleSelecao}
                avaliadoresContagemMap={avaliadoresContagemMap}
                modalidadesMap={modalidadesMap}
                onSalvar={salvarAtribuicoes}
                onFechar={fecharModalAtribuicao}
            />
            <ModalDetalhesAvaliacao
                avaliacaoModal={avaliacaoModal}
                criteriosMap={criteriosMap}
                onFechar={fecharAvaliacao}
                modalidadesMap={modalidadesMap}
            />

            {alerta && (
                <Alerta
                    key={alerta.reacao}
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
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
