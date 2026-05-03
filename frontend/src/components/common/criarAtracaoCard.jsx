import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import { MdEdit, MdSchool, MdAttachFile, MdSearch, MdDelete, MdArrowBack, MdLocalOffer, MdAddCircle } from 'react-icons/md';
import { BsCheckCircle, BsPlusCircleFill } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import SecaoFormulario from './secaoFormulario';
import { useState, useEffect } from 'react';

const LIMITS = {
    titulo: { min: 3, max: 250 },
    resumo: { minWords: 250, maxWords: 500 },
    palavras_chave: { max: 250 },
};

export default function CriarAtracaoCard({
    formState, setFormState,
    opcoes,
    eventos,
    usuarios,
    handleSalvarRascunho,
    handleSubmeter,
}) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        const words = formState.resumo?.trim().split(/\s+/).filter(word => word.length > 0) || [];
        setWordCount(words.length);
    }, [formState.resumo]);

    const validateField = (name, value) => {
        switch (name) {
            case 'titulo':
                if (!value || value.length < LIMITS.titulo.min) {
                    return `Título deve ter pelo menos ${LIMITS.titulo.min} caracteres`;
                }
                if (value.length > LIMITS.titulo.max) {
                    return `Título deve ter no máximo ${LIMITS.titulo.max} caracteres`;
                }
                break;
            case 'resumo':
                if (!value || wordCount < LIMITS.resumo.minWords) {
                    return `Resumo deve ter pelo menos ${LIMITS.resumo.minWords} palavras (atual: ${wordCount})`;
                }
                if (wordCount > LIMITS.resumo.maxWords) {
                    return `Resumo deve ter no máximo ${LIMITS.resumo.maxWords} palavras (atual: ${wordCount})`;
                }
                break;
            case 'palavras_chave':
                if (!value || value.trim().length === 0) {
                    return 'Palavras-chave são obrigatórias';
                }
                if (value.length > LIMITS.palavras_chave.max) {
                    return `Palavras-chave devem ter no máximo ${LIMITS.palavras_chave.max} caracteres`;
                }
                break;
            case 'modalidade':
                if (!value) return 'Selecione uma modalidade';
                break;
            case 'nivel_ensino':
                if (!value) return 'Selecione um nível de ensino';
                break;
            case 'area_conhecimento':
                if (!value) return 'Selecione uma área de conhecimento';
                break;
            case 'evento':
                if (!value) return 'Selecione um evento';
                break;
            default:
                break;
        }
        return null;
    };

    const handleBlur = (fieldName) => {
        setTouched({ ...touched, [fieldName]: true });
        const fieldValue = formState[fieldName];
        const error = validateField(fieldName, fieldValue);
        setErrors({ ...errors, [fieldName]: error });
    };

    const handleChange = (fieldName, value) => {
        setFormState({ ...formState, [fieldName]: value });
        if (touched[fieldName]) {
            const error = validateField(fieldName, value);
            setErrors({ ...errors, [fieldName]: error });
        }
    };

    const getFieldStyle = (fieldName) => {
        if (!touched[fieldName]) return {};
        const error = errors[fieldName];
        if (error) {
            return { border: '2px solid #dc3545' };
        }
        return { border: '2px solid #198754' };
    };

    const handleAddMembro = () => {
        const novaEquipe = [...formState.equipe, { nome: '', instituicao_curso: '', funcao: 'COAUTOR' }];
        setFormState({ ...formState, equipe: novaEquipe });
    };

    const handleRemoveMembro = (index) => {
        const novaEquipe = formState.equipe.filter((_, i) => i !== index);
        setFormState({ ...formState, equipe: novaEquipe });
    };

    const handleMembroChange = (index, field, value) => {
        const novaEquipe = [...formState.equipe];
        novaEquipe[index][field] = value;
        setFormState({ ...formState, equipe: novaEquipe });
    };

    const validateAll = () => {
        const fields = ['titulo', 'resumo', 'palavras_chave', 'modalidade', 'nivel_ensino', 'area_conhecimento', 'evento'];
        let newErrors = {};
        let isValid = true;
        
        fields.forEach(field => {
            const error = validateField(field, formState[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });
        
        setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
        setErrors(newErrors);
        return isValid;
    };

    const labelStyle = { color: '#00A44B', fontWeight: 'bold' };

    const handleSalvarRascunhoClick = () => {
        if (validateAll()) {
            handleSalvarRascunho();
        }
    };

    const handleSubmeterClick = () => {
        if (validateAll()) {
            handleSubmeter();
        }
    };

    const getNomeUsuario = (usuario) =>
        usuario?.nome ||
        usuario?.name ||
        usuario?.username ||
        `Usuário ${usuario?.id}`;

    return (
        <Container className="py-2">
            <Form>
                {/* SEÇÃO 1: CLASSIFICAÇÃO DO TRABALHO */}
                <SecaoFormulario icone={MdLocalOffer} titulo="Classificação do Trabalho">
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Modalidade *</Form.Label>
                                <Form.Select
                                    value={formState.modalidade}
                                    onChange={(e) => handleChange('modalidade', e.target.value)}
                                    onBlur={() => handleBlur('modalidade')}
                                    style={{ backgroundColor: '#eeeeee', ...getFieldStyle('modalidade') }}
                                    isValid={touched.modalidade && !errors.modalidade}
                                    isInvalid={touched.modalidade && errors.modalidade}
                                >
                                    <option value="">Selecione uma Modalidade</option>
                                    {opcoes.modalidades?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                                {touched.modalidade && errors.modalidade && (
                                    <Form.Text className="text-danger">{errors.modalidade}</Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Nível de Ensino *</Form.Label>
                                <Form.Select
                                    value={formState.nivel_ensino}
                                    onChange={(e) => handleChange('nivel_ensino', e.target.value)}
                                    onBlur={() => handleBlur('nivel_ensino')}
                                    style={{ backgroundColor: '#eeeeee', ...getFieldStyle('nivel_ensino') }}
                                    isValid={touched.nivel_ensino && !errors.nivel_ensino}
                                    isInvalid={touched.nivel_ensino && errors.nivel_ensino}
                                >
                                    <option value="">Selecione o Nível de Ensino</option>
                                    {opcoes.niveis_ensino?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                                {touched.nivel_ensino && errors.nivel_ensino && (
                                    <Form.Text className="text-danger">{errors.nivel_ensino}</Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Área do Conhecimento *</Form.Label>
                                <Form.Select
                                    value={formState.area_conhecimento}
                                    onChange={(e) => handleChange('area_conhecimento', e.target.value)}
                                    onBlur={() => handleBlur('area_conhecimento')}
                                    style={{ backgroundColor: '#eeeeee', ...getFieldStyle('area_conhecimento') }}
                                    isValid={touched.area_conhecimento && !errors.area_conhecimento}
                                    isInvalid={touched.area_conhecimento && errors.area_conhecimento}
                                >
                                    <option value="">Selecione a Área</option>
                                    {opcoes.areas_conhecimento?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                                {touched.area_conhecimento && errors.area_conhecimento && (
                                    <Form.Text className="text-danger">{errors.area_conhecimento}</Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                </SecaoFormulario>

                {/* SEÇÃO 2: DETALHES DO TRABALHO */}
                <SecaoFormulario icone={MdEdit} titulo="Detalhes do Trabalho">
                    <Form.Group className="mb-3">
                        <Form.Label style={labelStyle}>
                            Título do Trabalho * 
                            <span className="text-muted fw-normal ms-2">
                                ({formState.titulo?.length || 0}/{LIMITS.titulo.max})
                            </span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Escreva o título completo"
                            value={formState.titulo}
                            onChange={(e) => handleChange('titulo', e.target.value)}
                            onBlur={() => handleBlur('titulo')}
                            style={{ backgroundColor: '#eeeeee', ...getFieldStyle('titulo') }}
                            isValid={touched.titulo && !errors.titulo}
                            isInvalid={touched.titulo && errors.titulo}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.titulo}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={labelStyle}>
                            Resumo * 
                            <span className="text-muted fw-normal ms-2">
                                ({wordCount} palavras - mín: {LIMITS.resumo.minWords}, máx: {LIMITS.resumo.maxWords})
                            </span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            placeholder="Mínimo de 250 e máximo de 500 palavras"
                            value={formState.resumo}
                            onChange={(e) => handleChange('resumo', e.target.value)}
                            onBlur={() => handleBlur('resumo')}
                            style={{ backgroundColor: '#eeeeee', ...getFieldStyle('resumo') }}
                            isValid={touched.resumo && !errors.resumo}
                            isInvalid={touched.resumo && errors.resumo}
                        />
                        <div className="d-flex justify-content-between mt-1">
                            <Form.Text className={wordCount < LIMITS.resumo.minWords ? 'text-warning' : wordCount > LIMITS.resumo.maxWords ? 'text-danger' : 'text-success'}>
                                {wordCount < LIMITS.resumo.minWords 
                                    ? `Faltam ${LIMITS.resumo.minWords - wordCount} palavras` 
                                    : wordCount > LIMITS.resumo.maxWords 
                                        ? `Excedeu ${wordCount - LIMITS.resumo.maxWords} palavras`
                                        : 'Quantidade ideal'}
                            </Form.Text>
                        </div>
                        {touched.resumo && errors.resumo && (
                            <div className="text-danger small mt-1">{errors.resumo}</div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={labelStyle}>
                            Palavras-chave * 
                            <span className="text-muted fw-normal ms-2">
                                ({formState.palavras_chave?.length || 0}/{LIMITS.palavras_chave.max})
                            </span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="ex: tecnologia, educação, inovação (separe por vírgulas)"
                            value={formState.palavras_chave}
                            onChange={(e) => handleChange('palavras_chave', e.target.value)}
                            onBlur={() => handleBlur('palavras_chave')}
                            style={{ backgroundColor: '#eeeeee', ...getFieldStyle('palavras_chave') }}
                            isValid={touched.palavras_chave && !errors.palavras_chave}
                            isInvalid={touched.palavras_chave && errors.palavras_chave}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.palavras_chave}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={labelStyle}>Evento *</Form.Label>
                        <Form.Select
                            value={formState.evento}
                            onChange={(e) => handleChange('evento', e.target.value)}
                            onBlur={() => handleBlur('evento')}
                            style={{ backgroundColor: '#eeeeee', ...getFieldStyle('evento') }}
                            isValid={touched.evento && !errors.evento}
                            isInvalid={touched.evento && errors.evento}
                        >
                            <option value="">Selecione um Evento</option>
                            {eventos?.map((evt) => (
                                <option key={evt.id} value={evt.id}>{evt.nome}</option>
                            ))}
                        </Form.Select>
                        {touched.evento && errors.evento && (
                            <Form.Text className="text-danger">{errors.evento}</Form.Text>
                        )}
                    </Form.Group>
                </SecaoFormulario>

                {/* SEÇÃO 3: EQUIPE */}
                <SecaoFormulario icone={FaUsers} titulo="Equipe">
                    <div className="mb-4">
                        <div className="d-flex align-items-center gap-4 mb-3">
                            <Form.Label style={labelStyle} className="mb-0">Orientador(a) *</Form.Label>
                            <Form.Check 
                                type="checkbox"
                                label="Sou o Orientador"
                                id="check-orientador"
                                className="fw-normal"
                                style={{ color: '#333' }}
                                checked={formState.sou_orientador}
                                onChange={(e) => setFormState({ ...formState, sou_orientador: e.target.checked })}
                            />
                        </div>

                        {!formState.sou_orientador && (
                            <div className="mb-3">
                                <Form.Select
                                    value={formState.orientador || ''}
                                    onChange={(e) =>
                                        setFormState({
                                            ...formState,
                                            orientador: e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        })
                                    }
                                    style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
                                    className="py-2"
                                >
                                    <option value="">Selecione o orientador</option>
                                    {usuarios?.map((usuario) => (
                                        <option key={usuario.id} value={usuario.id}>
                                            {getNomeUsuario(usuario)}
                                        </option>
                                    ))}
                                </Form.Select>
                                <div className="mt-2" style={{ fontSize: '0.95rem', color: '#333' }}>
                                    O orientador receberá um e-mail para validar este trabalho.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <h6 className="fw-bold mb-3" style={{ color: '#00A44B' }}>Autores e Coautores</h6>
                        <Table hover className="mt-3 align-middle" style={{ border: '1px solid #dee2e6', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <th className="py-2 px-3 fw-bold text-dark" style={{ background: '#F8F9FA', borderRight: '1px solid #dee2e6', width: '35%' }}>Nome Completo</th>
                                    <th className="py-2 px-3 fw-bold text-dark" style={{ background: '#F8F9FA', borderRight: '1px solid #dee2e6', width: '35%' }}>Curso/Instituição (Req 1.15)</th>
                                    <th className="py-2 px-3 fw-bold text-dark" style={{ background: '#F8F9FA', borderRight: '1px solid #dee2e6', width: '20%' }}>Papel</th>
                                    <th className="py-2 px-3 fw-bold text-dark text-center" style={{ background: '#F8F9FA', width: '10%' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Linha do Autor Principal */}
                                <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td className="px-3 py-2" style={{ borderRight: '1px solid #dee2e6' }}>João Silva (Você)</td>
                                    <td className="px-3 py-2" style={{ borderRight: '1px solid #dee2e6' }}>Sistemas de Informação</td>
                                    <td className="px-3 py-2" style={{ borderRight: '1px solid #dee2e6' }}>
                                        <span className="badge rounded-pill px-2 py-2 fw-bold" style={{ backgroundColor: '#3B82F6', minWidth: '100px' }}>Autor Principal</span>
                                    </td>
                                    <td className="text-center py-2">-</td>
                                </tr>

                                {formState.equipe.map((membro, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td className="px-3 py-2" style={{ borderRight: '1px solid #dee2e6' }}>
                                            <Form.Control 
                                                value={membro.nome}
                                                onChange={(e) => handleMembroChange(index, 'nome', e.target.value)}
                                                placeholder="Nome do coautor"
                                                style={{ border: '1px solid #dee2e6', borderRadius: '6px', fontSize: '0.95rem' }}
                                                className="bg-white"
                                            />
                                        </td>
                                        <td className="px-3 py-2" style={{ borderRight: '1px solid #dee2e6' }}>
                                            <Form.Select 
                                                value={membro.instituicao_curso}
                                                onChange={(e) => handleMembroChange(index, 'instituicao_curso', e.target.value)}
                                                style={{ border: '1px solid #dee2e6', borderRadius: '6px', fontSize: '0.95rem' }}
                                                className="bg-white"
                                            >
                                                <option value="">Sistemas de Informação</option>
                                                <option value="Administração">Administração</option>
                                                <option value="Eletrônica">Eletrônica</option>
                                            </Form.Select>
                                        </td>
                                        <td className="px-3 py-2" style={{ borderRight: '1px solid #dee2e6' }}>
                                            <span style={{ color: '#666' }}>Coautor</span>
                                        </td>
                                        <td className="text-center py-2">
                                            <Button 
                                                variant="danger" 
                                                className="p-1" 
                                                style={{ backgroundColor: '#e24c4c', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => handleRemoveMembro(index)}
                                            >
                                                <MdDelete size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        
                    <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleAddMembro}
                            className="d-flex align-items-center gap-2 px-3 py-2 fw-bold mt-3"
                            style={{ backgroundColor: '#3B9BFF', border: 'none', borderRadius: '10px' }}
                        >
                            <BsPlusCircleFill size={18} /> Adicionar Coautor
                        </Button>
                    </div>
                </SecaoFormulario>

                {/* SEÇÃO 4: ANEXOS E FINALIZAÇÃO */}
                <SecaoFormulario icone={MdAttachFile} titulo="Anexos e Finalização">
                    <Form.Group className="mb-4">
                        <Form.Label style={labelStyle}>Anexo I *</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="application/pdf"
                            onChange={(e) => setFormState({ ...formState, anexo_pdf: e.target.files[0] })}
                            style={{ backgroundColor: '#eeeeee', border: '1px solid #ddd' }}
                        />
                        <div className="small text-muted mt-1">Apenas formato PDF. Tamanho máx: 10MB.</div>
                    </Form.Group>

                    <Form.Check 
                        type="checkbox"
                        label="Necessito de recursos de Acessibilidade ou Atendimento Especializado"
                        id="check-acessibilidade"
                        className="mb-4 fw-bold p-3 ps-5 rounded"
                        style={{ color: '#333', backgroundColor: '#e0f4ff', border: '1px solid #bde4ff' }}
                        checked={formState.acessibilidade}
                        onChange={(e) => setFormState({ ...formState, acessibilidade: e.target.checked })}
                    />
                    <hr style={{ borderTop: '1px solid #ddd', marginTop: '20px' }} />
                </SecaoFormulario>

                {/* BOTÕES DE AÇÃO */}
                <div className="d-flex justify-content-end gap-3 mt-5 mb-5">
                    <Button 
                        variant="primary" 
                        className="px-4 d-flex align-items-center gap-2 shadow-sm"
                        style={{ backgroundColor: '#3B9BFF', border: 'none', borderRadius: '12px' }}
                        onClick={() => window.history.back()}
                    >
                        <MdArrowBack size={20} /> Voltar
                    </Button>
                    
                    <Button 
                        variant="secondary" 
                        className="px-4 shadow-sm"
                        style={{ backgroundColor: '#707070', border: 'none', borderRadius: '12px' }}
                        onClick={handleSalvarRascunhoClick}
                    >
                        Salvar rascunho
                    </Button>

                    <Button 
                        onClick={handleSubmeterClick}
                        variant="success" 
                        className="px-4 d-flex align-items-center gap-2 shadow-sm"
                        style={{ backgroundColor: '#38A149', border: 'none', borderRadius: '12px' }}
                    >
                        <BsCheckCircle size={20} /> Submeter o Trabalho
                    </Button>
                </div>
            </Form>
        </Container>
    );
}