import { useEffect, useMemo, useState } from 'react';
import { pegarGrupo, atualizarUsuarios } from '../services/gruposService';
import eArray from '../utils/eArray';

export function useUsersGrupos(users) {
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [editingUsers, setEditingUsers] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchGroup() {
            if (!selectedGroupId) {
                setSelectedGroup(null);
                setEditingUsers(new Set());
                return;
            }

            try {
                const group = await pegarGrupo(selectedGroupId);
                setSelectedGroup(group);
                const usersId = new Set((group.users || []).map((u) => u.id));
                setEditingUsers(usersId);
                setMessage('');
            } catch (erro) {
                console.error('Falha ao buscar grupo:', erro);
                setSelectedGroup(null);
            }
        }

        fetchGroup();
    }, [selectedGroupId]);

    const [usersDoGrupo, usersNaoDoGrupo] = useMemo(() => {
        const doGrupo = eArray(users)
            ? users.filter((u) => editingUsers.has(u.id))
            : [];
        const naoDoGrupo = eArray(users)
            ? users.filter((u) => !editingUsers.has(u.id))
            : [];
        return [doGrupo, naoDoGrupo];
    }, [editingUsers, users]);

    const originalUsers = useMemo(() => {
        if (!selectedGroup) return new Set();
        return new Set(selectedGroup.users.map((u) => u.id));
    }, [selectedGroup]);

    const hasChanges = useMemo(() => {
        if (!selectedGroup) return false;
        if (editingUsers.size !== originalUsers.size) return true;
        for (const id of editingUsers) {
            if (!originalUsers.has(id)) return true;
        }
        return false;
    }, [editingUsers, originalUsers, selectedGroup]);

    const handleAddUser = (userId) => {
        const next = new Set(editingUsers);
        next.add(userId);
        setEditingUsers(next);
    };

    const handleRemoveUser = (userId) => {
        const next = new Set(editingUsers);
        next.delete(userId);
        setEditingUsers(next);
    };

    const handleSave = async () => {
        if (!selectedGroupId) return;

        setLoading(true);
        try {
            const userIds = Array.from(editingUsers);
            await atualizarUsuarios(selectedGroupId, userIds);
            setMessage({
                type: 'success',
                text: 'Usuários salvos com sucesso!',
            });

            // atualiza grupo
            const group = await pegarGrupo(selectedGroupId);
            setSelectedGroup(group);
        } catch (erro) {
            console.error('Falha ao salvar:', erro);
            setMessage({ type: 'danger', text: 'Erro ao salvar usuários' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (selectedGroup) {
            const usersId = new Set(selectedGroup.users.map((u) => u.id));
            setEditingUsers(usersId);
            setMessage('');
        }
    };

    return {
        selectedGroupId,
        setSelectedGroupId,
        selectedGroup,
        usersDoGrupo,
        usersNaoDoGrupo,
        loading,
        message,
        setMessage,
        handleAddUser,
        handleRemoveUser,
        handleSave,
        handleReset,
        hasChanges,
    };
}
