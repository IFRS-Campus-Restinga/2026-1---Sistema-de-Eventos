import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Alerta from '../components/common/Alerta';
import FiltroAvaliadores from '../components/gerenciar_avaliadores/FiltroAvaliadores';
import TabelaAtibuicao from '../components/gerenciar_avaliadores/TabelaAtribuicao';
import ModalAtribuicao from '../components/gerenciar_avaliadores/ModalAtribuicao';
import ModalDetalhesAvaliacao from '../components/gerenciar_avaliadores/ModalDetalhesAvaliacao';
import useGerenciarAvaliadoresSubmissoes from '../hooks/useGerenciarAvaliadoresSubmissoes';

export default function GerenciarAvaliacoesSubmissoes({}) {
    const [searchParams] = useSearchParams();
    const eventoId = searchParams.get('evento_id');

    const {
        alerta,
        submissoes,
        filtroBusca,
        setFiltroBusca,
        filtroModalidade,
        setFiltroModalidade,
        opcoesModalidade,
        aoFiltrar,
        abrirModalAtribuicao,
        exibirModal,
        selecionada,
        usuarios,
        manualBusca,
        setManualBusca,
        selecionadasSugestoes,
        setSelecionadasSugestoes,
        salvarAtribuicoes,
        fecharModalAtribuicao,
        avaliadoresContagemMap,
        modalidadesMap,
        isMobile,
        filtroArea,
        setFiltroArea,
        areaOptions,
        ordenarOpcoes,
        valorOrdenacao,
        onOrdenacaoChange,
        avaliacoesMap,
        destaquesMap,
        criteriosMap,
        eventosMap,
        abrirAvaliacao,
        fecharAvaliacao,
        removerAvaliadorDaTabela,
        avaliacaoModal,
    } = useGerenciarAvaliadoresSubmissoes(eventoId);

    const handleHomologarMock = () => {};
    const handleCancelarMock = () => {};

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
                                SubmissÕes
                            </span>
                            <span className="fs-5">
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
                                mostrarBusca={true}
                                mostrarModalidade={true}
                                mostrarArea={true}
                                mostrarOrdenacao={false}
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
                                trabalhos={submissoes}
                                modalidadesMap={modalidadesMap}
                                avaliacoesMap={avaliacoesMap}
                                destaquesMap={destaquesMap}
                                eventosMap={eventosMap}
                                onAbrirAvaliacao={abrirAvaliacao}
                                onRemoverAvaliador={removerAvaliadorDaTabela}
                                onAtribuir={abrirModalAtribuicao}
                                onHomologar={handleHomologarMock}
                                onCancelar={handleCancelarMock}
                                homologar={true}
                                cancelar={true}
                                destaque={false}
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
                onBuscarUsuarios={() => {}}
                sugestoes={[]}
                usuarios={usuarios}
                selecionadasSugestoes={selecionadasSugestoes}
                toggleSelecao={(perfilId) => {
                    setSelecionadasSugestoes((prev) =>
                        prev.includes(perfilId)
                            ? prev.filter((p) => p !== perfilId)
                            : [...prev, perfilId],
                    );
                }}
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
                    key={alerta.reacao || Date.now()}
                    mensagem={alerta.mensagem}
                    variacao={alerta.variacao}
                    reacao={alerta.reacao || Date.now()}
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
