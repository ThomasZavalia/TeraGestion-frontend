import React from 'react';
import { Heading, Box, Button, HStack, Spinner,
  Alert, AlertIcon,} from '@chakra-ui/react';
import {AddIcon} from "@chakra-ui/icons";
import { usePacientes } from '../../hooks/usePacientes';
import { TablaPacientes } from './component/TablaPacientes';





const PacientesPage = () => {

  const {pacientes, loading, error} = usePacientes();

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



    return <TablaPacientes pacientes={pacientes} />;//llama al componente tabla si pasa con exitos los if
  }



  return (
    <Box>
      <HStack>
        <Heading>Pacientes</Heading>
        <Button leftIcon={<AddIcon />} colorScheme='teal'>
          Agregar Paciente
        </Button>
      </HStack>

      <Box>
        {contenido()}
      </Box>
    </Box>
  );
};

export default PacientesPage;