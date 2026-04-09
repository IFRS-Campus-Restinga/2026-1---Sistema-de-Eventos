import { useEffect, useMemo, useState } from 'react';
import { pegarGrupo, atualizarPermissoes } from '../services/gruposService';
import eArray from '../utils/eArray';

export function useGroupPermissions(perms) {
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [editingPermissions, setEditingPermissions] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchGroup() {
            if (!selectedGroupId) {
                setSelectedGroup(null);
                setEditingPermissions(new Set());
                return;
            }

            try {
                const group = await pegarGrupo(selectedGroupId);
                setSelectedGroup(group);
                const permIds = new Set(group.permissions.map((p) => p.id));
                setEditingPermissions(permIds);
                setMessage('');
            } catch (erro) {
                console.error('Falha ao buscar grupo:', erro);
                setSelectedGroup(null);
            }
        }

        fetchGroup();
    }, [selectedGroupId]);

    const [permsDoGrupo, permsNaoDoGrupo] = useMemo(() => {
        const doGrupo = eArray(perms)
            ? perms.filter((p) => editingPermissions.has(p.id))
            : [];
        const naoDoGrupo = eArray(perms)
            ? perms.filter((p) => !editingPermissions.has(p.id))
            : [];
        return [doGrupo, naoDoGrupo];
    }, [editingPermissions, perms]);

    const originalPermissions = useMemo(() => {
        if (!selectedGroup) return new Set();
        return new Set(selectedGroup.permissions.map((p) => p.id));
    }, [selectedGroup]);

    const hasChanges = useMemo(() => {
        if (!selectedGroup) return false;
        if (editingPermissions.size !== originalPermissions.size) return true;
        for (const id of editingPermissions) {
            if (!originalPermissions.has(id)) return true;
        }
        return false;
    }, [editingPermissions, originalPermissions, selectedGroup]);

    const handleAddPermission = (permId) => {
        const next = new Set(editingPermissions);
        next.add(permId);
        setEditingPermissions(next);
    };

    const handleRemovePermission = (permId) => {
        const next = new Set(editingPermissions);
        next.delete(permId);
        setEditingPermissions(next);
    };

    const handleSave = async () => {
        if (!selectedGroupId) return;

        setLoading(true);
        try {
            const permissionIds = Array.from(editingPermissions);
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
            const permIds = new Set(selectedGroup.permissions.map((p) => p.id));
            setEditingPermissions(permIds);
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
