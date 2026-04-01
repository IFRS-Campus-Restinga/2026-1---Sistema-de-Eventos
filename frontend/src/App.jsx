import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PermissoesGroups from './pages/PermissoesGrupos';
import PessoasGrupos from './pages/PessoasGrupos';

function App() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/permissoesGrupos" element={<PermissoesGroups />} />
                <Route path="/usuarioGrupos" element={<PessoasGrupos />} />
            </Routes>
        </div>
    );
}

export default App;
