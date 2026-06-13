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

        removerAvaliadorDaTabela,
        abrirModalAtribuicao,

        eventosMap,
    } = useGerenciarAvaliadoresAtracoes(eventoId);

    // MOCK
    const SUBMISSOES = [
        {
            id: 14,
            titulo: 'A prática da caminhada como promoção da saúde comunitária',
            resumo: 'Discussão sobre os benefícios da caminhada regular para a prevenção de doenças crônicas e melhoria da qualidade de vida.',
            palavras_chave: 'atividade física, saúde, prevenção',
            modalidade: 3,
            tipo: 'Pôster',
            nivel_ensino: 'GRADUACAO',
            nivel_ensino_display: 'Graduação',
            area_conhecimento: 'CIENCIAS_DA_SAUDE',
            autor_nome: '',
            orientador: null,
            orientador_nome: '',
            anexo_pdf: null,
            acessibilidade: false,
            evento: 3,
            status: 'CONFIRMADA',
            sugestao_vagas: null,
            equipe: [],
            equipe_json: '',
            autorias: [],
            autoria_json: '',
            equipe_nomes: [],
            data_hora_inicio: null,
            data_hora_fim: null,
            espaco: null,
            espaco_detalhe: null,
            local_atracao: null,
            respostas_campos: {},
            respostas_campos_json: '',
            avaliadores: [],
            nota_media: null,
        },
        {
            id: 15,
            titulo: 'Educação alimentar e hábitos saudáveis entre universitários',
            resumo: 'Análise de estratégias para incentivar escolhas alimentares saudáveis no ambiente acadêmico.',
            palavras_chave: 'nutrição, educação, saúde',
            modalidade: 3,
            tipo: 'Pôster',
            nivel_ensino: 'GRADUACAO',
            nivel_ensino_display: 'Graduação',
            area_conhecimento: 'CIENCIAS_DA_SAUDE',
            autor_nome: '',
            orientador: null,
            orientador_nome: '',
            anexo_pdf: null,
            acessibilidade: false,
            evento: 3,
            status: 'CONFIRMADA',
            sugestao_vagas: null,
            equipe: [],
            equipe_json: '',
            autorias: [],
            autoria_json: '',
            equipe_nomes: [],
            data_hora_inicio: null,
            data_hora_fim: null,
            espaco: null,
            espaco_detalhe: null,
            local_atracao: null,
            respostas_campos: {},
            respostas_campos_json: '',
            avaliadores: [],
            nota_media: null,
        },
        {
            id: 16,
            titulo: 'Yoga e bem-estar: contribuições para a saúde mental',
            resumo: 'Relato sobre os efeitos da prática de yoga na redução do estresse e na promoção do equilíbrio emocional.',
            palavras_chave: 'saúde mental, yoga, qualidade de vida',
            modalidade: 3,
            tipo: 'Pôster',
            nivel_ensino: 'GRADUACAO',
            nivel_ensino_display: 'Graduação',
            area_conhecimento: 'CIENCIAS_DA_SAUDE',
            autor_nome: '',
            orientador: null,
            orientador_nome: '',
            anexo_pdf: null,
            acessibilidade: false,
            evento: 3,
            status: 'CONFIRMADA',
            sugestao_vagas: null,
            equipe: [],
            equipe_json: '',
            autorias: [],
            autoria_json: '',
            equipe_nomes: [],
            data_hora_inicio: null,
            data_hora_fim: null,
            espaco: null,
            espaco_detalhe: null,
            local_atracao: null,
            respostas_campos: {},
            respostas_campos_json: '',
            avaliadores: [],
            nota_media: null,
        },
        {
            id: 17,
            titulo: 'Esportes coletivos e desenvolvimento de habilidades sociais',
            resumo: 'Investigação sobre como a participação em esportes coletivos contribui para o trabalho em equipe e a integração social.',
            palavras_chave: 'esporte, inclusão, desenvolvimento social',
            modalidade: 3,
            tipo: 'Pôster',
            nivel_ensino: 'GRADUACAO',
            nivel_ensino_display: 'Graduação',
            area_conhecimento: 'CIENCIAS_DA_SAUDE',
            autor_nome: '',
            orientador: null,
            orientador_nome: '',
            anexo_pdf: null,
            acessibilidade: false,
            evento: 3,
            status: 'CONFIRMADA',
            sugestao_vagas: null,
            equipe: [],
            equipe_json: '',
            autorias: [],
            autoria_json: '',
            equipe_nomes: [],
            data_hora_inicio: null,
            data_hora_fim: null,
            espaco: null,
            espaco_detalhe: null,
            local_atracao: null,
            respostas_campos: {},
            respostas_campos_json: '',
            avaliadores: [],
            nota_media: null,
        },
        {
            id: 18,
            titulo: 'Práticas de lazer ativo para envelhecimento saudável',
            resumo: 'Apresentação de atividades recreativas que favorecem a autonomia e a saúde de pessoas idosas.',
            palavras_chave: 'envelhecimento, lazer, saúde',
            modalidade: 3,
            tipo: 'Pôster',
            nivel_ensino: 'GRADUACAO',
            nivel_ensino_display: 'Graduação',
            area_conhecimento: 'CIENCIAS_DA_SAUDE',
            autor_nome: '',
            orientador: null,
            orientador_nome: '',
            anexo_pdf: null,
            acessibilidade: false,
            evento: 3,
            status: 'CONFIRMADA',
            sugestao_vagas: null,
            equipe: [],
            equipe_json: '',
            autorias: [],
            autoria_json: '',
            equipe_nomes: [],
            data_hora_inicio: null,
            data_hora_fim: null,
            espaco: null,
            espaco_detalhe: null,
            local_atracao: null,
            respostas_campos: {},
            respostas_campos_json: '',
            avaliadores: [],
            nota_media: null,
        },
    ];
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
                                trabalhos={SUBMISSOES}
                                modalidadesMap={modalidadesMap}
                                avaliacoesMap={avaliacoesMap}
                                destaquesMap={destaquesMap}
                                eventosMap={eventosMap}
                                onAtribuir={abrirModalAtribuicao}
                                homologar={true}
                                cancelar={true}
                            />
                        </Col>
                    </Row>
                </Container>
            </main>

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
