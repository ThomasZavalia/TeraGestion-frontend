import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { usuarioService } from '../../services/UsuarioService'; 

import PerfilForm from './components/PerfilForm';
import ContrasenaForm from './components/ContraseñaForm';
import DisponibilidadForm from './components/DisponibilidadForm';
import ObrasSocialesCRUD from './components/ObrasSocialesCrud';
import ConfiguracionAgendaForm from './components/ConfiguracionAgendaForm'; 

const PerfilPage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();


  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await usuarioService.getMyProfile();
        setUserData(data);
      } catch (error) {
        toast({ title: "Error al cargar perfil", status: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [toast]);

  if (isLoading) {
    return <Center h="300px"><Spinner size="xl" /></Center>;
  }

  return (
    <Box>
      <Heading mb={6}>Configuración</Heading>

      <Tabs isLazy colorScheme='blue'> 
        <TabList>
          <Tab>Mi Perfil</Tab>
          <Tab>Cambiar Contraseña</Tab>
          <Tab>Disponibilidad Horaria</Tab>
           <Tab>Obras Sociales</Tab> 
           <Tab>Agenda</Tab>
        </TabList>

        <TabPanels>
          
          <TabPanel>
            <Box maxW="lg">
              <PerfilForm initialData={userData} />
            </Box>
          </TabPanel>

        
          <TabPanel>
             <Box maxW="lg">
               <ContrasenaForm />
             </Box>
          </TabPanel>

        
          <TabPanel>
             <Box maxW="xl"> 
               <DisponibilidadForm />
             </Box>
          </TabPanel>
          
          <TabPanel>
               
                <ObrasSocialesCRUD />
           </TabPanel>

           <TabPanel> 
             <Box maxW="lg">
                <ConfiguracionAgendaForm />
             </Box>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PerfilPage;