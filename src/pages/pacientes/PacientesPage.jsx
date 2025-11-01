import React, { useState, useRef } from 'react'; 
import {
  Heading, Box, Button, HStack, Spinner,
  Alert, AlertIcon, useDisclosure, useToast, Tooltip
} from '@chakra-ui/react';
import { AddIcon } from "@chakra-ui/icons";
import { usePacientes } from '../../hooks/usePacientes';
import { TablaPacientes } from './component/TablaPacientes';
import { FormularioPacienteModal } from './component/FormularioPacienteModal';
import { ComfirmarEliminarModal } from './component/ComfirmarEliminarModal';

const PacientesPage = () => {

  const { pacientes, loading, error, recargarPacientes, eliminarPaciente } = usePacientes();
  const toast = useToast();

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [pacienteActual, setPacienteActual] = useState(null);

  const handleNuevo = () => {
    setPacienteActual(null);
    onFormOpen(); 
  };

  const handleEditar = (paciente) => {
    setPacienteActual(paciente);
    onFormOpen(); 
  };

  const handleGuardado = () => {
    onFormClose(); 
    recargarPacientes();
  };

  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [isEliminando, setIsEliminando] = useState(false);
  const cancelRef = useRef(); 

  
  const handleEliminar = (paciente) => {
    setPacienteAEliminar(paciente); 
    onAlertOpen(); 
  };

  const confirmarEliminar = async () => {
    setIsEliminando(true);
    try {
      await eliminarPaciente(pacienteAEliminar.id);
      toast({
        title: "Paciente eliminado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar el paciente",
        description: error.message, 
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsEliminando(false);
      onAlertClose();
      setPacienteAEliminar(null);
    }
  };

  const contenido = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={10}>
          <Spinner size="xl" />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert status='error'>
          <AlertIcon />
          Error al cargar los pacientes.
        </Alert>
      );
    }

    return <TablaPacientes 
              pacientes={pacientes} 
              onEditar={handleEditar} 
              onEliminar={handleEliminar} 
            />;
  };

  return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={10}>
        <Heading>Pacientes</Heading>
        <Tooltip label="Agregar Paciente" aria-label="Agregar Paciente">
          <Button leftIcon={<AddIcon />} colorScheme='teal' onClick={handleNuevo}>
            Agregar Paciente
          </Button>
        </Tooltip>
      </HStack>

      <Box>
        {contenido()}
      </Box>

      
      <FormularioPacienteModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        onGuardado={handleGuardado}
        pacienteAEditar={pacienteActual}
      />

      
      <ComfirmarEliminarModal
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onConfirmar={confirmarEliminar}
        paciente={pacienteAEliminar}
        isLoading={isEliminando}
        leastDestructiveRef={cancelRef} 
      />
    </Box>
  );
};

export default PacientesPage;