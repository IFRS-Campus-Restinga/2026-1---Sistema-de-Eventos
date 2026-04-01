import axios from 'axios';

export const pegarGrupos = async () => {
    const response = await axios.get('http://localhost:8000/api/grupos/')
    return response.data
}

export const pegarGrupo = async (id) => {
    if (!id) return null
    const response = await axios.get(`http://localhost:8000/api/grupos/${id}/`)
    return response.data
}

export const atualizarPermissoes = async (id, idPerms) => {
    if (!id) return null
    const response = await axios.patch(`http://localhost:8000/api/grupos/${id}/`, {
        permission_id: idPerms
    })
    console.log(idPerms)
    return response.data
}
