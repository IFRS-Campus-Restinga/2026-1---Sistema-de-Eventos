import { useState, useCallback } from 'react';
import { registrarPresencaEvento } from '../services/presencaService';

export default function usePresencaEvento() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrarPresenca = useCallback(async (eventoId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registrarPresencaEvento(eventoId);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { registrarPresenca, loading, error };
}