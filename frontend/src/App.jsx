import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PermissoesGroups from './pages/PermissoesGrupos';
import PessoasGrupos from './pages/PessoasGrupos';
import PermissoesPessoas from './pages/PermissoesPessoas';
import LocaisEspacosListar from './pages/LocaisEspacosListar';
import LocalForm from './pages/LocalForm';
import LocaisListar from './pages/LocaisListar';
import Dashboard from './pages/Dashboard';
import CadastroComplementar from './pages/CadastroComplementar';
import AdicionarEvento from './pages/AdicionarEvento';
import ListarEnvento from './pages/ListarEvento';

function App() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* prettier-ignore */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/permissoesGrupos" element={<PermissoesGroups />} />
                <Route path="/usuarioGrupos" element={<PessoasGrupos />} />
                <Route path="/adicionarLocal" element={<LocalForm />} />
                <Route path="/listarLocaisEspacos" element={<LocaisEspacosListar />} />
                <Route path="/editarLocal/:id" element={<LocalForm />} />
                <Route path="/permissoesPessoas" element={<PermissoesPessoas />} />
                <Route path="/adicionarEvento" element={<AdicionarEvento/>}/>
                <Route path="/ListarEventos" element={<ListarEnvento />} />
                <Route path="/listarLocais" element={<LocaisListar />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cadastroComplementar"  element={<CadastroComplementar />} />
            </Routes>
        </div>
    );
}

export default App;
