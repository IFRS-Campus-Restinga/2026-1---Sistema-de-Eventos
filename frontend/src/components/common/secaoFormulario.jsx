
import { Card } from 'react-bootstrap';

// Recebe o ícone, o título e o conteúdo (children)
export default function SecaoFormulario({ icone: Icone, titulo, children }) {
    return (
        <Card className="mb-4 shadow-sm" style={{ borderLeft: '8px solid #00A44B', borderRadius: '8px' }}>
            <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                    {/* O componente de ícone é renderizado aqui */}
                    <Icone size={28} className="me-2" style={{ color: '#00A44B' }} />
                    <h4 className="fw-bold mb-0" style={{ color: '#00A44B' }}>
                        {titulo}
                    </h4>
                </div>
                {/* O formulário que estiver dentro da tag aparecerá aqui */}
                {children}
            </Card.Body>
        </Card>
    );
}