import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
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
import ListarEnvento from './pages/ListarEvento';
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
import ListarInscritos from './pages/ListarInscritos';
import MeusEventos from './pages/MeusEventos';
import SemResultado from './pages/SemResultado';
import SubmeterTrabalho from './pages/SubmeterTrabalho';
import PresencaEvento from './pages/AlunoCredenciamento';
//import SessaoBoard from './pages/SessaoBoard';
import SessaoBoard from './pages/sessaoteste';
function App() {
    const ADMIN_GROUPS = ['Administrador', 'Coordenador'];
    const protegido = (rota, gruposPermitidos) => (
        <ProtectedRoute gruposPermitidos={gruposPermitidos}>
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
                <Route path="/" element={<Home />} />
                <Route path="/cadastroComplementar" element={<CadastroComplementar />} />

                {/* Sessao / Autenticacao    */}
                {/* callback para session/token e auth (SSO) */}
                <Route path="/session/token/" element={<SessionTokenCallback />} />
                <Route path="/session/token/*" element={<SessionTokenCallback />} />
                <Route path="/session/auth" element={<SessionTokenCallback />} />
                <Route path="/session/auth/*" element={<SessionTokenCallback />} />

                {/* Eventos (criacao/edicao) */}
                {/* eventulmente tem q tirar esse dashboard sem id, já que ele tem q ter, por lógica*/}
                <Route path="/dashboard" element={protegido(<Dashboard />, ADMIN_GROUPS)} />
                <Route path="/dashboard/:id" element={protegido(<Dashboard />, ADMIN_GROUPS)} />
                <Route path="/adicionarEvento" element={<AdicionarEvento />} />
                <Route path="/editarEvento/:id" element={<AdicionarEvento />} />
                <Route path="/ListarEventos" element={<ListarEnvento />} />
                <Route path="/detalhe-evento/:id" element={<DetalheEvento />} />

                {/* Locais & Espacos */}
                <Route path="/adicionarLocal" element={protegido(<LocalForm />, ADMIN_GROUPS)} />
                <Route path="/editarLocal/:id" element={protegido(<LocalForm />, ADMIN_GROUPS)} />
                <Route path="/listarLocaisEspacos" element={protegido(<LocaisEspacosListar />, ADMIN_GROUPS)} />
                <Route path="/listarLocais" element={protegido(<LocaisListar />, ADMIN_GROUPS)} />
                <Route path="/adicionarEspaco" element={protegido(<EspacoForm />, ADMIN_GROUPS)} />
                <Route path="/editarEspaco/:id" element={protegido(<EspacoForm />, ADMIN_GROUPS)} />

                {/* Atracoes & Inscritos */}
                <Route path="/listarAtracoes" element={protegido(<ListarAtracoes />, ADMIN_GROUPS)} />
                <Route path="/adicionarAtracao" element={protegido(<AdicionarAtracao />, ADMIN_GROUPS)} />
                <Route path="/listarInscritos" element={protegido(<ListarInscritos />, ADMIN_GROUPS)} />
                <Route path="/meusEventos" element={protegido(<MeusEventos />)} />
                <Route path="/credenciamento/:eventoId" element={protegido(<PresencaEvento />, ADMIN_GROUPS)} />

                {/* Submissões e Avaliações */}
                <Route path="/SubmeterTrabalho" element={protegido(<SubmeterTrabalho />, ADMIN_GROUPS)} />

                {/* Permissoes / Grupos / Pessoas */}
                <Route path="/permissoesGrupos" element={protegido(<PermissoesGroups />, ADMIN_GROUPS)} />
                <Route path="/usuarioGrupos" element={protegido(<PessoasGrupos />, ADMIN_GROUPS)} />
                <Route path="/permissoesPessoas" element={protegido(<PermissoesPessoas />, ADMIN_GROUPS)} />

                {/* Modalidades      */}
                <Route path="/listarModalidades" element={protegido(<ModalidadesListar />, ADMIN_GROUPS)} />
                <Route path="/adicionarModalidade" element={protegido(<ModalidadeFormulario />, ADMIN_GROUPS)} />
                <Route path="/editarModalidade/:id" element={protegido(<ModalidadeFormulario />, ADMIN_GROUPS)} />

                {/* Atribuicoes / Organizadores */}
                <Route path="/atribuirCoordenador" element={protegido(<DefinirCoordenadorEvento />, ADMIN_GROUPS)} />
                <Route path="/atribuirOrganizador" element={protegido(<DefinirOrganizadorEvento />, ADMIN_GROUPS)} />

                <Route path="*" element={<SemResultado/>}/>

                {/* Dashboard / Tests / Misc */}
                <Route path="/teste" element={protegido(<Teste />, ADMIN_GROUPS)} />

                {/* Programação / Sessão de Eventos */}
                <Route path="/sessaoAtribuirData" element={<SessaoBoard />} />

            </Routes>
        </div>
    );
}

export default App;
