import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/UsuarioService';
import { useToast } from '@chakra-ui/react';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    recargarUsuarios: cargarUsuarios
  };
};