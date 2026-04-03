import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PermissoesGroups from './pages/PermissoesGrupos';
import PessoasGrupos from './pages/PessoasGrupos';
import LocaisListar from './pages/LocaisListar';
import LocalAdicionar from './pages/LocalAdicionar';

function App() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/permissoesGrupos" element={<PermissoesGroups />} />
                <Route path="/usuarioGrupos" element={<PessoasGrupos />} />

                <Route path="/adicionarLocal" element={<LocalAdicionar />} />
                <Route path="/listarLocais" element={<LocaisListar />} />

            </Routes>
        </div>
    );
}

export default App;
