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
import SessionTokenCallback from './pages/SessionTokenCallback';
import Teste from './pages/Teste';
import ModalidadeFormulario from './pages/ModalidadeFormulario';
import ModalidadesListar from './pages/ModalidadesListar';
import DefinirCoordenadorEvento from './pages/DefinirCoordenadorEvento';
import ProtectedRoute from './components/common/ProtectedRoute';
import DefinirOrganizadorEvento from './pages/DefinirOrganizadorEvento';

function App() {
    const ADMIN_GROUPS = ['Administrador', 'Coordenador'];
    const protegido = (rota, gruposPermitidos) => (
        <ProtectedRoute gruposPermitidos={gruposPermitidos}>{rota}</ProtectedRoute>
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
                <Route path="/" element={<Home />} />
                <Route path="/permissoesGrupos" element={protegido(<PermissoesGroups />, ADMIN_GROUPS)} />
                <Route path="/usuarioGrupos" element={protegido(<PessoasGrupos />, ADMIN_GROUPS)} />
                <Route path="/adicionarLocal" element={protegido(<LocalForm />, ADMIN_GROUPS)} />
                <Route path="/listarLocaisEspacos" element={protegido(<LocaisEspacosListar />, ADMIN_GROUPS)} />
                <Route path="/editarLocal/:id" element={protegido(<LocalForm />, ADMIN_GROUPS)} />
                <Route path="/adicionarEspaco" element={protegido(<EspacoForm />, ADMIN_GROUPS)} />
                <Route path="/editarEspaco/:id" element={protegido(<EspacoForm />, ADMIN_GROUPS)} />
                <Route path="/permissoesPessoas" element={protegido(<PermissoesPessoas />, ADMIN_GROUPS)} />
                {/*<Route path="/adicionarEvento" element={protegido(<AdicionarEvento />, ADMIN_GROUPS)} />*/}
                {/*<Route path="/ListarEventos" element={protegido(<ListarEnvento />, ADMIN_GROUPS)} />*/}
                <Route path="/adicionarEvento" element={<AdicionarEvento />} />
                <Route path="/ListarEventos" element={<ListarEnvento />} />
                <Route path="/listarLocais" element={protegido(<LocaisListar />, ADMIN_GROUPS)} />
                <Route path="/dashboard" element={protegido(<Dashboard />, ADMIN_GROUPS)} />
                <Route path="/cadastroComplementar" element={<CadastroComplementar />} />
                <Route path="/permissoesGrupos" element={<PermissoesGroups />} />
                <Route path="/usuarioGrupos" element={<PessoasGrupos />} />
                <Route path="/adicionarLocal" element={<LocalForm />} />
                <Route path="/listarLocaisEspacos" element={<LocaisEspacosListar />} />
                <Route path="/editarLocal/:id" element={<LocalForm />} />
                <Route path="/adicionarEspaco" element={<EspacoForm />} />
                <Route path="/editarEspaco/:id" element={<EspacoForm />} />
                <Route path="/permissoesPessoas" element={<PermissoesPessoas />} />
                <Route path="/adicionarEvento" element={<AdicionarEvento/>}/>
                <Route path="/editarEvento/:id" element={<AdicionarEvento/>}/>
                <Route path="/ListarEventos" element={<ListarEnvento />} />
                <Route path="/listarLocais" element={<LocaisListar />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cadastroComplementar"  element={<CadastroComplementar />} />
                <Route path="/session/token/" element={<SessionTokenCallback />} />
                <Route path="/session/token/*" element={<SessionTokenCallback />} />
                <Route path="/session/auth" element={<SessionTokenCallback />} />
                <Route path="/session/auth/*" element={<SessionTokenCallback />} />
                <Route path="/teste" element={protegido(<Teste />, ADMIN_GROUPS)} />
                <Route path="/listarModalidades" element={protegido(<ModalidadesListar />, ADMIN_GROUPS)} />
                <Route path="/adicionarModalidade" element={protegido(<ModalidadeFormulario />, ADMIN_GROUPS)} />
                <Route path="/editarModalidade/:id" element={protegido(<ModalidadeFormulario />, ADMIN_GROUPS)} />
                <Route path="/atribuirCoordenador" element={protegido(<DefinirCoordenadorEvento />, ADMIN_GROUPS)} />
                <Route path="/atribuirOrganizador" element={protegido(<DefinirOrganizadorEvento />, ADMIN_GROUPS)} />

            </Routes>
        </div>
    );
}

export default App;
