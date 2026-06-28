import { useEffect, useMemo, useState } from 'react';
import { pegarUser, atualizarPermissoesUsers } from '../services/userService';

export function useUsersPermissoes(allPermissions) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingPermissions, setEditingPermissions] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchUser() {
            if (!selectedUserId) {
                setSelectedUser(null);
                setEditingPermissions(new Set());
                return;
            }

            try {
                const user = await pegarUser(selectedUserId);
                setSelectedUser(user);
                const permIds = new Set(
                    (user.permissions || []).map((p) => p.id),
                );
                setEditingPermissions(permIds);
                setMessage('');
            } catch (erro) {
                console.error('Falha ao buscar usuário:', erro);
                setSelectedUser(null);
            }
        }

        fetchUser();
    }, [selectedUserId]);

    // permissões que o user tem e não tem
    const [permsDoUser, permsNaoDoUser] = useMemo(() => {
        const sourcePermissions = Array.isArray(allPermissions)
            ? allPermissions
            : [];
        const doUser = sourcePermissions.filter((p) =>
            editingPermissions.has(p.id),
        );
        const naoDoUser = sourcePermissions.filter(
            (p) => !editingPermissions.has(p.id),
        );
        return [doUser, naoDoUser];
    }, [editingPermissions, allPermissions]);

    const originalPermissions = useMemo(() => {
        if (!selectedUser) return new Set();
        return new Set((selectedUser.permissions || []).map((p) => p.id));
    }, [selectedUser]);

    const hasChanges = useMemo(() => {
        if (!selectedUser) return false;
        if (editingPermissions.size !== originalPermissions.size) return true;
        for (const id of editingPermissions) {
            if (!originalPermissions.has(id)) return true;
        }
        return false;
    }, [editingPermissions, originalPermissions, selectedUser]);

    const handleAddPermission = (permIds) => {
        const ids = Array.isArray(permIds) ? permIds : [permIds];
        setEditingPermissions((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.add(id));
            return next;
        });
    };

    const handleRemovePermission = (permIds) => {
        const ids = Array.isArray(permIds) ? permIds : [permIds];
        setEditingPermissions((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedUserId) return;

        setLoading(true);
        try {
            const permIds = Array.from(editingPermissions);
            await atualizarPermissoesUsers(selectedUserId, permIds);
            setMessage({
                type: 'success',
                text: 'Permissões salvas com sucesso!',
            });

            const user = await pegarUser(selectedUserId);
            setSelectedUser(user);
        } catch (erro) {
            console.error('Falha ao salvar:', erro);
            setMessage({ type: 'danger', text: 'Erro ao salvar permissões' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (selectedUser) {
            const permIds = new Set(
                (selectedUser.permissions || []).map((p) => p.id),
            );
            setEditingPermissions(permIds);
            setMessage('');
        }
    };

    return {
        selectedUserId,
        setSelectedUserId,
        selectedUser,
        permsDoUser,
        permsNaoDoUser,
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
