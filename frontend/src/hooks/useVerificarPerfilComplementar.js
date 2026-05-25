import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkSession } from '../services/authService';

/**
 * Hook que verifica se o usuário completou o cadastro complementar.
 * Se não completou, redireciona para a página de cadastro complementar.
 * Útil para proteger páginas que requerem perfil preenchido (como inscrição em eventos).
 */
export function useVerificarPerfilComplementar() {
    const navegar = useNavigate();
    const localizacao = useLocation();

    useEffect(() => {
        async function verificarPerfilComplementar() {
            try {
                const resultado = await checkSession();

                if (resultado.autenticado && resultado.usuario) {
                    // Se não tem perfil_id preenchido, redireciona para cadastro complementar
                    if (!resultado.usuario.perfil_id) {
                        navegar('/cadastro_complementar', {
                            replace: true,
                            state: { de: localizacao },
                        });
                    }
                } else {
                    // Usuário não autenticado
                }
            } catch (erro) {
                console.error('Erro ao verificar perfil complementar:', erro);
            }
        }

        verificarPerfilComplementar();
    }, [navegar, localizacao]);
}
