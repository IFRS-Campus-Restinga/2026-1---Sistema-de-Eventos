import { API_URL } from '../config';
import axios from 'axios';
import { pegarTokenCsrf } from './csrfService';

export const fazerUploadArquivo = async (eventoId, arquivo) => {
    if (!eventoId || !arquivo) return null;

    const csrfData = await pegarTokenCsrf();
    const csrfToken = csrfData?.csrfToken || '';

    const formData = new FormData();
    formData.append('evento', eventoId);
    formData.append('arquivo', arquivo); // O arquivo vindo do input type="file"
    formData.append('nome_arquivo', arquivo.name);

    const response = await axios.post(`${API_URL}/api/arquivos/`, formData, {
        headers: { 
            'X-CSRFToken': csrfToken,
            'Content-Type': 'multipart/form-data' 
        },
        withCredentials: true,
    });

    return response.data;
};