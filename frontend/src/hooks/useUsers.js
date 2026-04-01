import { useEffect, useState } from 'react';

import { pegarUsers } from '../services/userService';

export function useUsers() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await pegarUsers();
                setUsers(data);
            } catch (erro) {
                console.error('erro', erro);
            }
        }
        fetchUsers();
    }, []);
    return { users };
}
