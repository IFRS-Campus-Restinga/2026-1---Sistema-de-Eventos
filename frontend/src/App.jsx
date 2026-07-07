import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListarCredenciais from './pages/ListarCredenciais';
import PermissoesGroups from './pages/PermissoesGrupos';
import PessoasGrupos from './pages/PessoasGrupos';
import PermissoesPessoas from './pages/PermissoesPessoas';
import LocaisEspacosListar from './pages/LocaisEspacosListar';
import LocalForm from './pages/LocalForm';
import LocaisListar from './pages/LocaisListar';
import EspacoForm from './pages/EspacoForm';
import Dashboard from './pages/Dashboard';
import CadastroComplementar from './pages/CadastroComplementar';
import AdicionarEvento from './pages/AdicionarEvento';
import ListarEvento from './pages/ListarEvento';
import DetalheEvento from './pages/DetalhamentoEvento';
import SessionTokenCallback from './pages/SessionTokenCallback';
import Teste from './pages/Teste';
import ModalidadeFormulario from './pages/ModalidadeFormulario';
import ModalidadesListar from './pages/ModalidadesListar';
import DefinirCoordenadorEvento from './pages/DefinirCoordenadorEvento';
import ProtectedRoute from './components/common/ProtectedRoute';
import DefinirOrganizadorEvento from './pages/DefinirOrganizadorEvento';
import AdicionarAtracao from './pages/AdicionarAtracao';
import ListarAtracoes from './pages/ListarAtracoes';
import ListarInscritosAtracao from './pages/ListarInscritosAtracao';
import MeusEventos from './pages/MeusEventos';
import MinhasParticipacoes from './pages/MinhasParticipacoes';
import MeusEventosAvaliador from './pages/MeusEventosAvaliador';
import SemResultado from './pages/SemResultado';
import AvaliarSubmissao from './pages/AvaliarSubmissao';
import PresencaEvento from './pages/AlunoCredenciamento';
import EnviarEmails from './pages/EnviarEmails';
import ConfigurarTemplates from './pages/ConfigurarTemplates';
import SessaoBoard from './pages/SessaoBoard';
import ListarInscritosEvento from './pages/ListarInscritosEvento';
import MinhasAvaliacoes from './pages/MinhasAvaliacoes';
import AvaliarAtracao from './pages/AvaliarAtracao';
import GerenciarAvaliadoresAtracoes from './pages/GerenciarAvaliadoresAtracoes';
import GerenciarAvaliadoresSubmissoes from './pages/GerenciarAvaliadoresSubmissoes';
import ProgramacaoEvento from './pages/ProgramacaoEvento';
import InscricaoAtracoes from './pages/InscricaoAtracoes';
import MinhasAvaliacoesSubmissoes from './pages/MinhasAvaliacoesSubmissoes';
import EtapaSubmissao from './pages/EtapaSubmissao'
import EtapaInscricaoEvento from './pages/EtapaInscricaoEvento'


const ADMIN_GROUPS = ['Administrador', 'Coordenador', 'Organizador'];

function App() {
    const protegido = (rota, gruposPermitidos) => (
        <ProtectedRoute gruposPermitidos={gruposPermitidos}>
            {rota}
        </ProtectedRoute>
    );

    const protegidoPorEvento = (rota, gruposPermitidos = ADMIN_GROUPS) => (
        <ProtectedRoute
            gruposPermitidos={gruposPermitidos}
            validarAcessoEvento
            redirectUnauthorizedTo="/listar_eventos"
        >
            {rota}
        </ProtectedRoute>
    );

    const protegidoComAvaliador = (rota, gruposPermitidos) => (
        <ProtectedRoute gruposPermitidos={gruposPermitidos} permitirAvaliador>
            {rota}
        </ProtectedRoute>
    );

    useEffect(() => {
        const { pathname, search, hash } = window.location;
        if (!pathname.startsWith('//')) {
            return;
        }

        const normalizedPathname = `/${pathname.replace(/^\/+/, '')}`;
        window.history.replaceState(
            {},
            document.title,
            `${normalizedPathname}${search}${hash}`,
        );
    }, []);

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* prettier-ignore */}
            <Routes>
                {/* Publico / Abertas        */}
                <Route path="/listar_credenciais" element={<ListarCredenciais />} />
                <Route path="/" element={<Home />} />
                <Route path="/cadastro_complementar" element={<CadastroComplementar />} />

                {/* Sessao / Autenticacao    */}
                {/* callback para session/token e auth (SSO) */}
                <Route path="/session/token/" element={<SessionTokenCallback />} />
                <Route path="/session/token/*" element={<SessionTokenCallback />} />
                <Route path="/session/auth" element={<SessionTokenCallback />} />
                <Route path="/session/auth/*" element={<SessionTokenCallback />} />

                {/* Eventos (criacao/edicao) */}
                {/* eventulmente tem q tirar esse dashboard sem id, já que ele tem q ter, por lógica*/}
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={protegido(<Dashboard />, ADMIN_GROUPS)} />
                <Route path="/dashboard/:id" element={protegidoPorEvento(<Dashboard />, ADMIN_GROUPS)} />
                <Route path="/adicionar_evento" element={protegidoPorEvento(<AdicionarEvento />,ADMIN_GROUPS.filter(m=>m=="Administrador"))} />
                <Route path="/editar_evento/:id" element={protegidoPorEvento(<AdicionarEvento />,ADMIN_GROUPS.filter(m=>m!=="Organizador"))} />
                <Route path="/listar_eventos" element={protegido(<ListarEvento />, ADMIN_GROUPS)} />
                <Route path="/detalhe_evento/:id" element={<DetalheEvento />} />
                <Route path="/programacao_evento/:id" element={<ProgramacaoEvento />} />
                <Route path="/etapa_submissao/:id" element={<EtapaSubmissao />} />
                <Route path="/etapa_inscricao/:id" element={<EtapaInscricaoEvento />} />

                {/* Comunicação com Publico (emails) */}
                <Route path="/dashboard/:id/enviar_emails" element={protegidoPorEvento(<EnviarEmails />, ADMIN_GROUPS.filter(m=>m!=="Organizador"))} />
                <Route path="/configurar_templates" element={protegido(<ConfigurarTemplates />, ADMIN_GROUPS.filter(m=>m!=="Organizador"))} />

                {/* Locais & Espacos */}
                <Route path="/adicionar_local" element={protegido(<LocalForm />, ADMIN_GROUPS)} />
                <Route path="/editar_local/:id" element={protegido(<LocalForm />, ADMIN_GROUPS)} />
                <Route path="/listar_locais_espacos" element={protegido(<LocaisEspacosListar />, ADMIN_GROUPS)} />
                <Route path="/listar_locais" element={protegido(<LocaisListar />, ADMIN_GROUPS)} />
                <Route path="/adicionar_espaco" element={protegido(<EspacoForm />, ADMIN_GROUPS)} />
                <Route path="/editar_espaco/:id" element={protegido(<EspacoForm />, ADMIN_GROUPS)} />

                {/* Atracoes & Inscritos */}
                <Route path="/listar_atracoes" element={protegido(<ListarAtracoes />, ADMIN_GROUPS.filter(m=>m=="Administrador"))} />
                <Route path="/listar_submissoes" element={protegido(<ListarAtracoes />, ADMIN_GROUPS.filter(m=>m=="Administrador"))} />
                <Route path="/inscrever_atracoes/:eventoId" element={<InscricaoAtracoes />} />
                <Route path="/adicionar_atracao" element={protegido(<AdicionarAtracao />)} />
                <Route path="/adicionar_submissao" element={protegido(<AdicionarAtracao />)} />
                <Route path="/listar_inscritos_evento" element={protegido(<ListarInscritosEvento />, ADMIN_GROUPS)} />
                <Route path="/listar_inscritos_atracao" element={protegido(<ListarInscritosAtracao />)} />
                <Route path="/meus_eventos" element={protegido(<MeusEventos />)} />
                <Route path="/meus_eventos/:eventoId/participacoes" element={protegido(<MinhasParticipacoes />)} />
                <Route path="/credenciamento/:eventoSlug" element={<PresencaEvento />} />

                {/* Submissões e Avaliações */}
                <Route path="/gerenciar_avaliadores_atracoes" element={protegido(<GerenciarAvaliadoresAtracoes />, ADMIN_GROUPS)} />
                <Route path="/gerenciar_avaliadores_submissoes" element={protegido(<GerenciarAvaliadoresSubmissoes />, ADMIN_GROUPS)} />
                <Route path="/minhas_avaliacoes_submissoes"  element={protegidoComAvaliador(<MinhasAvaliacoesSubmissoes />, ADMIN_GROUPS)}/>
                <Route path="/meus_eventos_avaliador"  element={protegidoComAvaliador(<MeusEventosAvaliador />, ADMIN_GROUPS)}/>
                <Route path="/avaliar_submissao" element={protegidoComAvaliador(<AvaliarSubmissao />, ADMIN_GROUPS)} />
                <Route path="/minhas_avaliacoes" element={protegidoComAvaliador(<MinhasAvaliacoes />, ADMIN_GROUPS)} />
                <Route path="/avaliar_atracao" element={protegidoComAvaliador(<AvaliarAtracao />, ADMIN_GROUPS)} />

                {/* Permissoes / Grupos / Pessoas */}
                <Route path="/permissoes_grupos" element={protegido(<PermissoesGroups />, ADMIN_GROUPS)} />
                <Route path="/usuario_grupos" element={protegido(<PessoasGrupos />, ADMIN_GROUPS)} />
                <Route path="/permissoes_pessoas" element={protegido(<PermissoesPessoas />, ADMIN_GROUPS)} />

                {/* Modalidades */}
                <Route path="/listar_modalidades" element={protegido(<ModalidadesListar />, ADMIN_GROUPS)} />
                <Route path="/adicionar_modalidade" element={protegido(<ModalidadeFormulario />, ADMIN_GROUPS)} />
                <Route path="/editar_modalidade/:id" element={protegido(<ModalidadeFormulario />, ADMIN_GROUPS)} />

                {/* Atribuicoes / Organizadores */}
                <Route path="/atribuir_coordenador" element={protegidoPorEvento(<DefinirCoordenadorEvento />, ADMIN_GROUPS.filter(m=>m=="Administrador"))} />
                <Route path="/atribuir_organizador" element={protegidoPorEvento(<DefinirOrganizadorEvento />, ADMIN_GROUPS.filter(m=>m!=="Organizador"))} />

                <Route path="*" element={<SemResultado/>}/>

                {/* Dashboard / Tests / Misc */}
                <Route path="/teste" element={protegido(<Teste />, ADMIN_GROUPS)} />

                {/* Programação / Sessão de Eventos */}
                <Route path="/dashboard/:id/sessao_atribuir_data" element={protegidoPorEvento(<SessaoBoard />, ADMIN_GROUPS)} />




            </Routes>
        </div>
    );
}

export default App;
