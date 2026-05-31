import { useState, useEffect, useCallback } from 'react';
import { enviarEmailsService } from '../services/enviarEmailsService';

export function useEnviarEmails(eventoId) {
    // Estados
    const [nomeEvento, setNomeEvento] = useState('');
    const [atracoes, setAtracoes] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [notificacao, setNotificacao] = useState({
        mensagem: '',
        variacao: '',
    });
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [atracoesSelecionadas, setAtracoesSelecionadas] = useState([]);
    const [enviando, setEnviando] = useState(false);
    // Fazendo agora
    const [templates, setTemplates] = useState([]);
    const [templateSelecionado, setTemplateSelecionado] = useState('');

    // Calcula o turno da atração | Manhã, Tarde ou Noite
    const calcularTurno = (dataHoraInicio) => {
        const hora = new Date(dataHoraInicio).getHours();
        if (hora < 12) return 'manha';
        if (hora < 18) return 'tarde';
        return 'noite';
    };

    // Busca as atrações do evento no Backend TODO: Refatorar para usar o service só percebi no final kk
    useEffect(() => {
        if (!eventoId) return;

        const buscarAtracoes = async () => {
            setCarregando(true);

            try {
                const resposta =
                    await enviarEmailsService.buscarAtracoesPorEvento(eventoId);

                const listaAtracoes = resposta.results || resposta;
                setNomeEvento(listaAtracoes[0].titulo);

                const atracoesComTurno = listaAtracoes.map((atracao) => ({
                    ...atracao,
                    turno: calcularTurno(atracao.data_hora_inicio),
                }));

                setAtracoes(atracoesComTurno);
                setAtracoesSelecionadas(atracoesComTurno.map((a) => a.id));
            } catch (erro) {
                console.error(erro);
            } finally {
                setCarregando(false);
            }
        };

        buscarAtracoes();
    }, [eventoId]);

    useEffect(() => {
        const carregarTemplates = async () => {
            // Busca do Sistema
            try {
                const resSistema =
                    await enviarEmailsService.buscarTemplatesSistema();
                const dados = resSistema.results || resSistema;
                setTemplates((prev) => [
                    ...prev.filter((t) => t.tipo !== 'sistema'),
                    ...dados.map((t) => ({ ...t, tipo: 'sistema' })),
                ]);
            } catch (erro) {
                console.error('Falha nos templates de sistema:', erro);
            }

            // Busca do Perfil
            try {
                const resPerfil =
                    await enviarEmailsService.buscarTemplatesPerfil();
                const dados = resPerfil.results || resPerfil;
                setTemplates((prev) => [
                    ...prev.filter((t) => t.tipo !== 'perfil'),
                    ...dados.map((t) => ({ ...t, tipo: 'perfil' })),
                ]);
            } catch (erro) {
                console.error('Falha nos templates de perfil:', erro);
            }
        };

        carregarTemplates();
    }, []);

    // Manipulador para gerenciar a troca de template e preencher a composição
    const handleTemplateChange = useCallback(
        (valor) => {
            setTemplateSelecionado(valor);

            if (!valor) {
                setAssunto('');
                setMensagem('');
                return;
            }

            const [tipo, idTarget] = valor.split('_');
            const templateEncontrado = templates.find(
                (t) => t.tipo === tipo && String(t.id) === String(idTarget),
            );

            if (templateEncontrado) {
                setAssunto(templateEncontrado.assunto || '');
                setMensagem(templateEncontrado.corpo_texto || '');
            }
        },
        [templates],
    );

    const handleCheckboxChange = useCallback((atracaoId) => {
        setAtracoesSelecionadas((prev) =>
            prev.includes(atracaoId)
                ? prev.filter((item) => item !== atracaoId)
                : [...prev, atracaoId],
        );
    }, []);

    const handleSelecionarTodos = useCallback(() => {
        if (
            atracoesSelecionadas.length === atracoes.length &&
            atracoes.length > 0
        ) {
            setAtracoesSelecionadas([]);
        } else {
            setAtracoesSelecionadas(atracoes.map((a) => a.id));
        }
    }, [atracoes, atracoesSelecionadas]);

    const handleSubmit = async (e, csrfToken) => {
        if (e) e.preventDefault();

        if (atracoesSelecionadas.length === 0) {
            alert('Selecione pelo menos uma atração.');
            return;
        }

        setEnviando(true);
        const payload = {
            atracoes_ids: atracoesSelecionadas,
            assunto,
            mensagem,
        };

        try {
            const dadosResposta = await enviarEmailsService.enviarComunicado(
                eventoId,
                payload,
                csrfToken,
            );

            setNotificacao({
                mensagem:
                    dadosResposta.detail || 'E-mails enviados com sucesso!',
                variacao: 'success',
            });

            setAssunto('');
            setMensagem('');
            setAtracoesSelecionadas([]);
        } catch (erro) {
            console.error('Erro detalhado do servidor:', erro.response?.data);

            setNotificacao({
                mensagem: 'Ocorreu um erro ao enviar os e-mails.',
                variacao: 'danger',
            });
        } finally {
            setEnviando(false);
        }
    };

    return {
        atracoes,
        nomeEvento,
        carregando,
        notificacao,
        assunto,
        setAssunto,
        mensagem,
        setMensagem,
        atracoesSelecionadas,
        enviando,
        handleCheckboxChange,
        handleSelecionarTodos,
        handleSubmit,
        handleTemplateChange,
        templates,
        templateSelecionado,
    };
}
