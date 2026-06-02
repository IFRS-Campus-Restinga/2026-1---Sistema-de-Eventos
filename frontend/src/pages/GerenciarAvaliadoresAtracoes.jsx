import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta';
import FiltroAvaliadores from '../components/gerenciar_avaliadores/FiltroAvaliadores';
import TabelaAtracoes from '../components/gerenciar_avaliadores/TabelaAtracoes';
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

            <main className=" py-4 ">
                <Container
                    fluid
                    className="d-md-flex flex-md-column align-items-md-center gap-3"
                >
                    <Row>
                        <Col>
                            <h1 className="fw-bold">Painel do Organizador</h1>
                            <span>
                                Gerencie trabalhos submetidos e distribua
                                avaliadores
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
                        }`}
                    >
                        <Col>
                            <TabelaAtracoes
                                atracoes={atracoes}
                                modalidadesMap={modalidadesMap}
                                avaliacoesMap={avaliacoesMap}
                                destaquesMap={destaquesMap}
                                eventosMap={eventosMap}
                                onAbrirAvaliacao={abrirAvaliacao}
                                onRemoverAvaliador={removerAvaliadorDaTabela}
                                onAtribuir={abrirModalAtribuicao}
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
