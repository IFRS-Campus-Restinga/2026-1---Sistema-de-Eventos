import { useEffect, useMemo, useState } from 'react';
import { pegarUsers, atualizarGrupos } from '../services/userService';
import { pegarGrupo } from '../services/groups_service';

export function useUsersGrupos(perms) {
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
                const usersId = new Set(group.permissions.map((p) => p.id));
                setEditingUsers(usersId);
                setMessage('');
            } catch (erro) {
                console.error('Falha ao buscar grupo:', erro);
                setSelectedGroup(null);
            }
        }

        fetchGroup();
    }, [selectedGroupId]);

    const [permsDoGrupo, permsNaoDoGrupo] = useMemo(() => {
        const doGrupo = perms.filter((p) => editingUsers.has(p.id));
        const naoDoGrupo = perms.filter((p) => !editingUsers.has(p.id));
        return [doGrupo, naoDoGrupo];
    }, [editingUsers, perms]);

    const originalPermissions = useMemo(() => {
        if (!selectedGroup) return new Set();
        return new Set(selectedGroup.permissions.map((p) => p.id));
    }, [selectedGroup]);

    const hasChanges = useMemo(() => {
        if (!selectedGroup) return false;
        if (editingUsers.size !== originalPermissions.size) return true;
        for (const id of editingUsers) {
            if (!originalPermissions.has(id)) return true;
        }
        return false;
    }, [editingUsers, originalPermissions, selectedGroup]);

    const handleAddPermission = (permId) => {
        const next = new Set(editingUsers);
        next.add(permId);
        setEditingUsers(next);
    };

    const handleRemovePermission = (permId) => {
        const next = new Set(editingUsers);
        next.delete(permId);
        setEditingUsers(next);
    };

    const handleSave = async () => {
        if (!selectedGroupId) return;

        setLoading(true);
        try {
            const permissionIds = Array.from(editingUsers);
            await atualizarPermissoes(selectedGroupId, permissionIds);
            setMessage({
                type: 'success',
                text: 'Permissões salvas com sucesso!',
            });

            // atualiza grupo
            const group = await pegarGrupo(selectedGroupId);
            setSelectedGroup(group);
        } catch (erro) {
            console.error('Falha ao salvar:', erro);
            setMessage({ type: 'danger', text: 'Erro ao salvar permissões' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (selectedGroup) {
            const usersId = new Set(selectedGroup.permissions.map((p) => p.id));
            setEditingUsers(usersId);
            setMessage('');
        }
    };

    return {
        selectedGroupId,
        setSelectedGroupId,
        selectedGroup,
        permsDoGrupo,
        permsNaoDoGrupo,
        loading,
        message,
        setMessage,
        handleAddPermission,
        handleRemovePermission,
        handleSave,
        handleReset,
        hasChanges,
    };
}
