import React, { useState } from 'react';
import NavBar from '../components/nav_bar/NavBar';
import Footer from '../components/footer/Footer';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/esm/Button';
import {
    BsTagsFill,
    BsPencilFill,
    BsPeopleFill,
    BsPaperclip,
    BsArrowLeft,
    BsCheckCircle,
} from 'react-icons/bs';
import FormularioCustomizado from '../components/custom-form-card/FormularioCustomizado';
import { useModalidades } from '../hooks/useModalidades';
import { useAreasConhecimento } from '../hooks/useAreasConhecimento';
import { useSetores } from '../hooks/useSetores';

// toda a classificação do trabalho já está puxando do backend.
// TO DO: criar o model da Subscrição
// TO DO: Verificar os campos do Formulário Equipe
// TO DO: Verificar os campos de Anexos e Finalização.
// TO DO: Formulário Dinamico Lógica

export default function SubmeterTrabalho({ campus = 'Campus Restinga' }) {
    const { modalidades } = useModalidades();
    const { areas: opcoesAreas } = useAreasConhecimento();
    const { setores: opcoesSetor } = useSetores();

    const [dadosTrabalho, setDadosTrabalho] = useState({
        modalidade: '',
        setor: '',
        areaConhecimento: '',
        titulo: '',
        resumo: '',
        palavrasChave: '',
        cargaHoraria: '',
        isOrientador: false,
        orientador: '',
        autores: [],
        anexoI: null,
        necessitaAcessibilidade: false,
    });

    // Cores da Página
    const cores = {
        card: '#00A44B',
        titulo: '#00A44B',
    };

    // Função para atualizar o estado com base na seleção
    const atualizarDados = (valor, idInstancia, nomeCampo) => {
        setDadosTrabalho((prev) => ({
            ...prev,
            [nomeCampo]: valor,
        }));
    };

    const opcoesModalidade = modalidades.map((m) => ({
        value: m.id,
        text: m.nome,
    }));

    // Mock
    const camposClassificacao = [
        {
            name: 'modalidade',
            titulo: 'Modalidade *',
            tipo: 'select',
            opcoes: [
                { value: '', text: 'Selecione uma Modalidade', disabled: true },
                ...opcoesModalidade,
            ],
            onChange: atualizarDados,
        },
        {
            name: 'setor',
            titulo: 'Setor *',
            tipo: 'select',
            opcoes: [
                { value: '', text: 'Selecione o Setor', disabled: true },
                ...opcoesSetor, // Substitui as 3 linhas fixas
            ],
            onChange: atualizarDados,
        },
        {
            name: 'areaConhecimento',
            titulo: 'Área do Conhecimento *',
            tipo: 'select',
            opcoes: [
                { value: '', text: 'Selecione a Área', disabled: true },
                // Substitua o mock por opcoesAreas
                ...opcoesAreas,
            ],
            onChange: atualizarDados,
        },
    ];

    // Mock
    const camposDetalhes = [
        {
            name: 'titulo',
            titulo: 'Título do Trabalho *',
            tipo: 'text',
            placeholder: 'Digite o Título do seu Trabalho',
            onChange: atualizarDados,
        },
        {
            name: 'resumo',
            titulo: 'Resumo *',
            tipo: 'textarea',
            placeholder: 'Informe o Resumo do seu Trabalho',
            onChange: atualizarDados,
        },
        {
            name: 'palavrasChave',
            titulo: 'Palavras-chave *',
            tipo: 'text',
            placeholder: 'Informe as Palavras-chave',
            onChange: atualizarDados,
        },
        {
            name: 'cargaHoraria',
            titulo: 'Carga Horária (horas) *',
            tipo: 'number',
            placeholder: 'Informe a carga horária prevista',
            min: 0,
            onChange: atualizarDados,
        },
    ];

    const mockCursos = [
        { value: 'si', text: 'Sistemas de Informação' },
        { value: 'ads', text: 'Análise e Desenvolvimento de Sistemas' },
        { value: 'redes', text: 'Redes de Computadores' },
        { value: 'eng_software', text: 'Engenharia de Software' },
    ];

    // Mock
    const camposEquipe = [
        {
            name: 'isOrientador',
            titulo: 'Sou o Orientador',
            tipo: 'switch',
            onChange: atualizarDados,
        },
        {
            name: 'orientador',
            titulo: 'Orientador(a) *',
            tipo: 'text',
            placeholder: 'Digite o nome ou CPF do orientador...',
            onChange: atualizarDados,
        },
        {
            name: 'autores',
            titulo: 'Autores e Coautores',
            tipo: 'equipe',
            // Propriedades injetadas para consumo interno do <CampoEquipe />
            cursos: mockCursos,
            desativarAdicao: true, // Flag para inativar o botão de adicionar por hora
            onChange: atualizarDados,
        },
    ];

    const camposAnexos = [
        {
            name: 'anexoI',
            titulo: 'Anexo I *',
            tipo: 'file',
            placeholder: 'Apenas formato PDF. Tamanho máx: 10MB.',
            onChange: atualizarDados,
        },
        {
            name: 'necessitaAcessibilidade',
            titulo: 'Necessito de recursos de Acessibilidade ou Atendimento Especializado',
            tipo: 'switch', // O RenderizarCampo renderizará isso como um switch toggle
            onChange: atualizarDados,
        },
    ];

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />

            <main className="flex-fill p-4">
                <Container className="d-flex flex-column gap-3">
                    <Row>
                        <FormularioCustomizado
                            titulo="Classificação do Trabalho"
                            Icone={<BsTagsFill size={20} />}
                            corTexto={cores.titulo}
                            campos={camposClassificacao}
                            orientacao="row"
                            add={false}
                        />
                    </Row>

                    <Row>
                        <FormularioCustomizado
                            titulo="Detalhes do Trabalho"
                            Icone={<BsPencilFill size={20} />}
                            corTexto={cores.titulo}
                            campos={camposDetalhes}
                            orientacao="column"
                            add={false}
                        />
                    </Row>

                    <Row>
                        <FormularioCustomizado
                            titulo="Equipe"
                            Icone={<BsPeopleFill size={20} />}
                            corTexto={cores.titulo}
                            campos={camposEquipe}
                            orientacao="column"
                            add={false}
                        />
                    </Row>

                    <Row>
                        <FormularioCustomizado
                            titulo="Anexos e Finalização"
                            Icone={<BsPaperclip size={20} />}
                            corTexto={cores.titulo}
                            campos={camposAnexos}
                            orientacao="column"
                            add={false}
                        />
                    </Row>

                    <Row className="mt-4 mb-5">
                        <Col className="d-flex justify-content-end gap-3">
                            <Button
                                variant="primary"
                                className="d-flex align-items-center gap-2 px-4"
                            >
                                <BsArrowLeft /> Voltar
                            </Button>

                            <Button variant="secondary" className="px-4">
                                Salvar rascunho
                            </Button>

                            <Button
                                variant="success"
                                className="d-flex align-items-center gap-2 px-4"
                                style={{
                                    backgroundColor: '#00A44B',
                                    borderColor: '#00A44B',
                                }}
                            >
                                <BsCheckCircle /> Submeter o Trabalho
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </main>

            <Footer
                telefone={'(51) 3333-1234'}
                endereco={'Rua Alberto Hoffmann, 285'}
                ano={2026}
                campus={campus}
            />
        </div>
    );
}
