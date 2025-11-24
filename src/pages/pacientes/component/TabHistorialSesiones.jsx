import React, { useState } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Alert, AlertIcon, IconButton, HStack, Badge, Icon,
  useDisclosure, useToast, Tooltip
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { FormularioSesionModal } from './FormularioSesionModal';
import { ComfirmarEliminarModal } from './ComfirmarEliminarModal';
import { SesionService } from '../../../services/SesionService/SesionService';


export const TabHistorialSesiones = ({ sesiones, onRecargar }) => {
  const toast = useToast();

  // --- Lógica para el Modal de Edición ---
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  const [sesionActual, setSesionActual] = useState(null);


  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);


  const handleEditar = (sesion) => {
    setSesionActual(sesion);
    onEditOpen();
  };

  const handleEliminar = (sesion) => {
    setSesionActual(sesion);
    onDeleteOpen();
  };

  const handleGuardado = () => {
    onEditClose();
    onRecargar();
  };

  const handleConfirmarEliminar = async () => {
    setIsDeleting(true);
    try {
      await SesionService.eliminarSesion(sesionActual.id);
      toast({ title: 'Sesión eliminada', status: 'success' });
      onRecargar();
    } catch (error) {
      toast({ title: 'Error al eliminar', description: error.message, status: 'error' });
    } finally {
      setIsDeleting(false);
      onDeleteClose();
      setSesionActual(null);
    }
  };


  if (!sesiones || sesiones.length === 0) {
    return (
      <Alert status="info" m={4}>
        <AlertIcon />
        El paciente no tiene sesiones registradas.
      </Alert>
    );
  }

  const formatFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleDateString('es-AR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  return (
    <Box p={4}>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Fecha</Th>
              <Th>Asistencia</Th>
              <Th>Notas (Estado)</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sesiones.map((sesion) => {
              const tieneNotas = sesion.notas && sesion.notas.trim() !== '';
              return (
                <Tr key={sesion.id}>
                  <Td>{formatFecha(sesion.fecha)}</Td>
                  <Td>
                    <Badge colorScheme={sesion.asistencia === 'Presente' ? 'green' : 'red'}>
                      {sesion.asistencia}
                    </Badge>
                  </Td>
                  <Td>
                    {tieneNotas ? (
                      <Badge colorScheme="green" variant="subtle">
                        <Icon as={CheckCircleIcon} mr={1} />
                        Completa
                      </Badge>
                    ) : (
                      <Badge colorScheme="yellow" variant="subtle">
                        <Icon as={WarningIcon} mr={1} />
                        Pendiente
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                        <Tooltip label="Editar Sesion" aria-label="Editar Sesion">
                            <IconButton
                                icon={<EditIcon />}
                                aria-label="Editar Sesión"
                                onFocus={(e) => e.preventDefault()}
                                onClick={() => handleEditar(sesion)}
                            />
                        </Tooltip>

                        <Tooltip label="Eliminar Sesion" aria-label="Eliminar Sesion">
                            <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Borrar Sesión"                               
                                onClick={() => handleEliminar(sesion)}
                            />
                        </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      <FormularioSesionModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onGuardado={handleGuardado}
        sesionAEditar={sesionActual}
      />
      
      <ComfirmarEliminarModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmarEliminar}
        isLoading={isDeleting}
        title="Eliminar Sesion"
      >

        ¿Estás seguro de que quieres eliminar esta sesión?
        Esta acción no se puede deshacer.
      </ComfirmarEliminarModal>
    </Box>
  );
};