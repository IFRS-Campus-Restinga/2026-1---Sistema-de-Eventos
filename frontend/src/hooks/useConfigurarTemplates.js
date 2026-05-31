import { useState, useEffect, useCallback } from 'react';
import { configurarTemplatesService } from '../services/configurarTemplatesService';

export function useConfigurarTemplates() {
    // Estados do formulário
    const [templates, setTemplates] = useState([]);
    const [templateEmEdicao, setTemplateEmEdicao] = useState(null);
    const [nomeExibicao, setNomeExibicao] = useState('');
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');

    // --- MOCKS (Funções inativas apenas para o front não quebrar) ---
    const carregarTemplates = useCallback(async () => {
        console.log('Mock: Carregando templates ignorado por enquanto.');
        setTemplates([]);
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

    const handleDeletar = async (templateId, csrfToken) => {
        console.log('Mock: Função de deletar acionada para o ID', templateId);
    };
    // --------------------------------------------------------------

    // --- FOCO: FUNÇÃO DE CRIAR ---
    const handleSalvar = async (e, csrfToken) => {
        e.preventDefault();

        const payload = {
            nome_exibicao: nomeExibicao,
            assunto: assunto,
            corpo_texto: mensagem,
        };

        // Se tiver template em edição, ignora (pois o foco agora é só criar)
        if (templateEmEdicao) {
            console.log('Mock: Função de edição acionada e ignorada.', payload);
            return;
        }

        try {
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

            // Limpa o formulário após a criação
            handleNovoTemplate();
        } catch (erro) {
            console.error('Falha na requisição de criação:', erro);
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
        handleDeletar,
    };
}
