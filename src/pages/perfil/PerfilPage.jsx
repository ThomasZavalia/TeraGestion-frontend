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
  VStack, // Para espaciar forms
} from '@chakra-ui/react';
import { usuarioService } from '../../services/UsuarioService'; // Ajusta ruta
// Importa los componentes de formulario
import PerfilForm from './components/PerfilForm';
import ContrasenaForm from './components/ContraseñaForm';
import DisponibilidadForm from './components/DisponibilidadForm';

const PerfilPage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Carga los datos del perfil al montar
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

      <Tabs isLazy colorScheme='blue'> {/* isLazy carga el contenido de la pestaña solo cuando se activa */}
        <TabList>
          <Tab>Mi Perfil</Tab>
          <Tab>Cambiar Contraseña</Tab>
          <Tab>Disponibilidad Horaria</Tab>
          {/* Puedes añadir más pestañas aquí (ej. Obras Sociales CRUD) */}
        </TabList>

        <TabPanels>
          {/* Pestaña: Mi Perfil */}
          <TabPanel>
            <Box maxW="lg"> {/* Limita el ancho del formulario */}
              <PerfilForm initialData={userData} />
            </Box>
          </TabPanel>

          {/* Pestaña: Cambiar Contraseña */}
          <TabPanel>
             <Box maxW="lg">
               <ContrasenaForm />
             </Box>
          </TabPanel>

          {/* Pestaña: Disponibilidad */}
          <TabPanel>
             <Box maxW="xl"> {/* Ancho un poco mayor para disponibilidad */}
               <DisponibilidadForm />
             </Box>
          </TabPanel>
          
           {/* Pestaña: Obras Sociales (Ejemplo) */}
           {/* <TabPanel>
                <Heading size="md" mb={4}>Gestionar Obras Sociales</Heading>
                {/* Aquí iría una tabla CRUD para Obras Sociales *}
           </TabPanel> */}

        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PerfilPage;