import { useState, useEffect, useCallback } from 'react';
import { configurarTemplatesService } from '../services/configurarTemplatesService';

export function useConfigurarTemplates() {
    // Estados do formulário
    const [templates, setTemplates] = useState([]);
    const [templateEmEdicao, setTemplateEmEdicao] = useState(null);
    const [nomeExibicao, setNomeExibicao] = useState('');
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [showModalExcluir, setShowModalExcluir] = useState(false);

    const carregarTemplates = useCallback(async () => {
        try {
            const dados =
                await configurarTemplatesService.buscarTemplatesPerfil();
            setTemplates(dados);
        } catch (erro) {
            console.error('Falha ao carregar os templates:', erro);
            setTemplates([]);
        }
    }, []);

    useEffect(() => {
        carregarTemplates();
    }, [carregarTemplates]);

    const handleSelecionarTemplate = (template) => {
        setTemplateEmEdicao(template);
        setNomeExibicao(template.nome_exibicao || '');
        setAssunto(template.assunto || '');
        setMensagem(template.corpo_texto || '');
    };

    const handleNovoTemplate = () => {
        setTemplateEmEdicao(null);
        setNomeExibicao('');
        setAssunto('');
        setMensagem('');
    };

    const handleDeletar = async (csrfToken) => {
        if (!templateEmEdicao) return;

        try {
            console.log(
                'Iniciando requisição DELETE para ID:',
                templateEmEdicao.id,
            );

            await configurarTemplatesService.deletarTemplatePerfil(
                templateEmEdicao.id,
                csrfToken,
            );

            console.log('Sucesso! Template excluído.');

            // Fecha o modal, limpa o form e atualiza a lista
            setShowModalExcluir(false);
            handleNovoTemplate();
            carregarTemplates();
        } catch (erro) {
            console.error('Falha na requisição de exclusão:', erro);
        }
    };

    const handleSalvar = async (e, csrfToken) => {
        e.preventDefault();

        const payload = {
            nome_exibicao: nomeExibicao,
            assunto: assunto,
            corpo_texto: mensagem,
        };

        try {
            if (templateEmEdicao) {
                // --- FOCO: EDITAR TEMPLATE EXISTENTE ---
                console.log(
                    'Iniciando requisição PATCH para atualizar template...',
                    payload,
                );

                const resposta =
                    await configurarTemplatesService.atualizarTemplatePerfil(
                        templateEmEdicao.id,
                        payload,
                        csrfToken,
                    );

                console.log('Sucesso! Template atualizado:', resposta);
                carregarTemplates(); // Recarrega a barra lateral para mostrar a edição
            } else {
                // --- CRIAR NOVO TEMPLATE (Mantido como estava) ---
                console.log(
                    'Iniciando requisição POST para criar template...',
                    payload,
                );

                const resposta =
                    await configurarTemplatesService.criarTemplatePerfil(
                        payload,
                        csrfToken,
                    );

                console.log(
                    'Sucesso! Template criado no banco de dados:',
                    resposta,
                );
                handleNovoTemplate(); // Limpa o formulário
                carregarTemplates(); // Recarrega a barra lateral para mostrar o novo template
            }
        } catch (erro) {
            console.error('Falha na requisição de salvar/atualizar:', erro);
        }
    };

    return {
        templates,
        templateEmEdicao,
        nomeExibicao,
        setNomeExibicao,
        assunto,
        setAssunto,
        mensagem,
        setMensagem,
        handleSelecionarTemplate,
        handleNovoTemplate,
        handleSalvar,
        showModalExcluir,
        setShowModalExcluir,
        handleDeletar,
    };
}
