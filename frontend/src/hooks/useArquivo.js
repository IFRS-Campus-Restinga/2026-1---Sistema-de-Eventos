import { useState } from 'react';

export function useArquivo() {
    const [arquivos, setArquivos] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // Função para fazer upload de um arquivo
    const uploadArquivo = async (file, csrfToken) => {
        if (!file) return;

        setCarregando(true);
        const formData = new FormData();
        formData.append('nome_arquivo', file.name);
        formData.append('arquivo', file);

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/arquivos/',
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                },
            );

            if (response.ok) {
                const novoArquivo = await response.json();
                setArquivos((prev) => [...prev, novoArquivo]);
                return novoArquivo;
            } else {
                const error = await response.json();
                throw new Error(
                    error.detail || 'Erro ao fazer upload do arquivo',
                );
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        } finally {
            setCarregando(false);
        }
    };

    // Função para remover arquivo da lista local
    const removerArquivo = (index) => {
        setArquivos((prev) => prev.filter((_, i) => i !== index));
    };

    // Função para limpar todos os arquivos
    const limparArquivos = () => {
        setArquivos([]);
    };

    return {
        arquivos,
        carregando,
        uploadArquivo,
        removerArquivo,
        limparArquivos,
    };
}
