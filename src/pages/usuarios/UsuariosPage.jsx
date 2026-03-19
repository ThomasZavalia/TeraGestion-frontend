import React, { useState } from 'react';
import {
  Box, Heading, Button, useDisclosure, useToast, HStack, Center, Spinner, useColorModeValue
} from '@chakra-ui/react';
import { FiUserPlus } from 'react-icons/fi';

import { useUsuarios } from '../../hooks/useUsuarios';
import { usuarioService } from '../../services/UsuarioService';
import TablaUsuarios from './components/TablaUsuarios';
import ModalUsuarioABM from './components/ModalUsuarioABM';
import ModalResetClave from './components/ModalResetClave';
import ModalDisponibilidad from './components/ModalDisponibilidad';

const UsuariosPage = () => {
  const { usuarios, loading, recargarUsuarios } = useUsuarios();
  const toast = useToast();
  const boxBg = useColorModeValue('white', 'gray.800');

  const { isOpen: isABMOpen, onOpen: onABMOpen, onClose: onABMClose } = useDisclosure();
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const { isOpen: isHorariosOpen, onOpen: onHorariosOpen, onClose: onHorariosClose } = useDisclosure();
  
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const abrirModalCrear = () => {
    setUsuarioActual(null);
    onABMOpen();
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioActual(usuario);
    onABMOpen();
  };

  const handleGuardarUsuario = async (formData) => {
    setIsSubmitting(true);
    try {
      if (usuarioActual) {
        await usuarioService.actualizarUsuario(usuarioActual.id, formData);
        toast({ title: 'Usuario actualizado', status: 'success' });
      } else {
        await usuarioService.crearUsuario(formData);
        toast({ title: 'Usuario creado', status: 'success' });
      }
      recargarUsuarios();
      onABMClose();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Verifique los datos', status: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await usuarioService.toggleEstadoUsuario(id);
      toast({ 
        title: estadoActual ? 'Usuario Bloqueado' : 'Usuario Desbloqueado', 
        status: estadoActual ? 'warning' : 'success' 
      });
      recargarUsuarios();
    } catch (error) {
      toast({ title: 'Error al cambiar estado', status: 'error' });
    }
  };

  const handleResetClave = async (nuevaClave) => {
    setIsSubmitting(true);
    try {
      await usuarioService.blanquearClave(usuarioActual.id, nuevaClave);
      toast({ title: 'Contraseña reseteada con éxito', status: 'success' });
      onResetClose();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo resetear la clave', status: 'error' });
    }
    setIsSubmitting(false);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Gestión de Personal</Heading>
        <Button leftIcon={<FiUserPlus />} colorScheme="blue" onClick={abrirModalCrear}>
          Nuevo Usuario
        </Button>
      </HStack>

      <Box bg={boxBg} p={4} borderRadius="md" shadow="md">
        {loading ? (
          <Center h="200px"><Spinner size="xl" /></Center>
        ) : (
          <TablaUsuarios 
            usuarios={usuarios} 
            onEdit={abrirModalEditar} 
            onResetClave={(u) => { setUsuarioActual(u); onResetOpen(); }} 
            onToggleEstado={handleToggleEstado} 
            onManageHorarios={(u) => { setUsuarioActual(u); onHorariosOpen(); }}
          />
        )}
      </Box>

      <ModalUsuarioABM 
        isOpen={isABMOpen} 
        onClose={onABMClose} 
        usuarioActual={usuarioActual} 
        onSave={handleGuardarUsuario} 
        isSubmitting={isSubmitting} 
      />

      <ModalResetClave 
        isOpen={isResetOpen} 
        onClose={onResetClose} 
        usuarioActual={usuarioActual} 
        onConfirm={handleResetClave} 
        isSubmitting={isSubmitting} 
      />

      <ModalDisponibilidad 
        isOpen={isHorariosOpen} 
        onClose={onHorariosClose} 
        usuarioActual={usuarioActual} 
/>
    </Box>
  );
};

export default UsuariosPage;