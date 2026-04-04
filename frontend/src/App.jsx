import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PermissoesGroups from './pages/PermissoesGrupos';
import PessoasGrupos from './pages/PessoasGrupos';
import PermissoesPessoas from './pages/PermissoesPessoas';
import LocaisEspacosListar from './pages/LocaisEspacosListar';
import LocalAdicionar from './pages/LocalAdicionar';
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/permissoesGrupos" element={<PermissoesGroups />} />
                <Route path="/usuarioGrupos" element={<PessoasGrupos />} />
                <Route path="/permissoesPessoas" element={<PermissoesPessoas />} />
                <Route path="/adicionarLocal" element={<LocalAdicionar />} />
                <Route path="/listarLocaisEspacos" element={<LocaisEspacosListar />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </div>
    );
}

export default App;