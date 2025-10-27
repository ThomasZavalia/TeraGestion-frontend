import React, { use } from 'react';
import { Heading, Box, Button, HStack, Spinner,
  Alert, AlertIcon, useDisclosure} from '@chakra-ui/react';
import {AddIcon} from "@chakra-ui/icons";
import { usePacientes } from '../../hooks/usePacientes';
import { TablaPacientes } from './component/TablaPacientes';
import { FormularioPacienteModal } from './component/FormularioPacienteModal';





const PacientesPage = () => {

  const {pacientes, loading, error, recargarPacientes} = usePacientes();
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [pacienteActual, setPacienteActual] = React.useState(null);

  const handleNuevo = () => {
    setPacienteActual(null);
    onOpen();
  }

  const handleEditar = (paciente) => {
    setPacienteActual(paciente);
    onOpen();
  }

  const handleGuardado = () => {
    onClose();
    recargarPacientes();
  }


  const contenido = () => {

    if(loading){
      return(
        <Box display="flex" justifyContent="center" p={10}>
          <Spinner size="xl" />
        </Box>
      );
    }

    if(error){
      return(
        <Alert status='error'>
          <AlertIcon />
          Error al cargar los pacientes.
        </Alert>
      );
    }



    return <TablaPacientes pacientes={pacientes} onEditar={handleEditar} />;//llama al componente tabla si pasa con exitos los if
  }



  return (
    <Box>
      <HStack>
        <Heading>Pacientes</Heading>
        <Button leftIcon={<AddIcon />} colorScheme='teal' onClick={handleNuevo}>
          Agregar Paciente
        </Button>
      </HStack>

      <Box>
        {contenido()}
      </Box>

      <FormularioPacienteModal
        isOpen={isOpen}
        onClose={onClose}
        onGuardado={handleGuardado}
        pacienteAEditar={pacienteActual}
        />
    </Box>
  );
};

export default PacientesPage;