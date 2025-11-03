import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
  Text,
  List,
  ListItem,
  ListIcon,
  Icon,
  VStack,
  Divider,
  Button, 
  HStack, 
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiDollarSign, FiPlusCircle, FiUserPlus, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; 
import { turnoService } from '../services/TurnoService'; 

import { format } from 'date-fns';
import { es } from 'date-fns/locale';


const StatCard = ({ title, stat, helpText, icon }) => (
  <Stat
    px={{ base: 4, md: 8 }}
    py={'5'}
    shadow={'md'}
    border={'1px solid'}
    borderColor={'gray.200'}
    rounded={'lg'}
    bg="white"
  >
    <StatLabel fontWeight={'medium'} isTruncated color="gray.500">
      {title}
    </StatLabel>
    <StatNumber fontSize={'2xl'} fontWeight={'medium'} color="gray.800">
      {stat}
    </StatNumber>
    {helpText && (
        <StatHelpText>
        {icon && <Icon as={icon} mr={1} w={4} h={4} />}
        {helpText}
        </StatHelpText>
    )}
  </Stat>
);

const TurnosHoyLista = ({ turnos }) => {
  const navigate = useNavigate();

  if (turnos.length === 0) {
    return <Text color="gray.500" fontSize="sm">No hay turnos programados para hoy.</Text>;
  }
  
  const turnosOrdenados = [...turnos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));


  const handleTurnoClick = (turno) => {
   
    navigate('/turnos'); 
  };

  return (
    <List spacing={3}>
      {turnosOrdenados.map((turno) => (
        <ListItem
          key={turno.id}
          p={3}
          bg="white"
          shadow="sm"
          borderRadius="md"
          borderLeft="4px solid"
          borderColor={turno.estado?.toLowerCase() === 'pagado' ? 'green.400' : 'blue.400'}
          onClick={() => handleTurnoClick(turno)}
          cursor="pointer"
          _hover={{ bg: 'gray.100', shadow: 'md' }}
          transition="all 0.2s ease"

        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Text fontWeight="bold" fontSize="sm">{`${turno.pacienteNombre} ${turno.pacienteApellido}`}</Text>
              <Text fontSize="xs" color="gray.600">
                <ListIcon as={FiClock} color="gray.500" />
                {format(new Date(turno.fecha), 'HH:mm', { locale: es })} hs 
              </Text>
            </Box>
            <Text fontSize="xs" color={turno.estado?.toLowerCase() === 'pagado' ? 'green.500' : 'gray.500'} fontWeight="medium">
              {turno.estado}
            </Text>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};


const HomePage = () => {
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [stats, setStats] = useState({ 
      ingresosHoy: 0, 
    
     turnosPendientesHoy: 0,
  }); 
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingTurnos(true);
      setLoadingStats(true); 

      try {
       
        const turnos = await turnoService.getTurnosDeHoy(); 
        setTurnosHoy(turnos);

        
      const ingresos = turnos
            .filter(t => t.estado?.toLowerCase() === 'pagado')
            .reduce((sum, t) => sum + (t.precio || 0), 0);
            
       
        const pendientes = turnos
            .filter(t => t.estado?.toLowerCase() === 'pendiente')
            .length;
      
      setStats({ 
            ingresosHoy: ingresos, 
            turnosPendientesHoy: pendientes,
           
        });
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoadingTurnos(false);
        setLoadingStats(false);
      }
    };
    cargarDatos();
  }, []);

  const handleNuevoPacienteClick = () => {
    navigate('/pacientes', { state: { abrirModalNuevo: true } });
  };

  
  return (
    <Box>
      <Heading mb={6}>Inicio</Heading>

      
     <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <StatCard
          title={'Turnos de Hoy'}
          stat={loadingTurnos ? <Spinner size="sm"/> : turnosHoy.length}
          helpText={format(new Date(), "eeee, dd MMMM", { locale: es })}
          icon={FiCalendar}
        />
        <StatCard
          title={'Ingresos del Día'}
          stat={loadingStats ? <Spinner size="sm"/> : `$ ${stats.ingresosHoy.toLocaleString('es-AR')}`}
          helpText="Solo turnos pagados hoy"
          icon={FiDollarSign}
        />
        <StatCard 
          title={'Turnos Pendientes (Hoy)'} 
          stat={loadingStats ? <Spinner size="sm"/> : stats.turnosPendientesHoy}
          helpText="Turnos por cobrar hoy"
          icon={FiAlertCircle} 
        />
      </SimpleGrid>

      <Divider my={8} />

  
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      
   
        <Box bg="gray.50" p={5} borderRadius="lg" shadow="sm" maxH="400px" overflowY="auto">
          <Heading size="md" mb={4} color="gray.700">Próximos Turnos del Día</Heading>
          {loadingTurnos ? (
            <Center h="150px"><Spinner /></Center>
          ) : (
            <TurnosHoyLista turnos={turnosHoy} />
          )}
        </Box>

       
       <Box bg="gray.50" p={5} borderRadius="lg" shadow="sm">
           <Heading size="md" mb={4} color="gray.700">Acciones Frecuentes</Heading>
           <VStack spacing={4} align="stretch">
              
              
               <Button
                 leftIcon={<FiUserPlus />}
                 colorScheme="blue"
                 variant="outline" 
                 onClick={handleNuevoPacienteClick} 
                 size="lg"
               >
                 Registrar Nuevo Paciente
               </Button>

             
               <Button
                 leftIcon={<FiPlusCircle />}
                 colorScheme="teal"
                 variant="outline"
                 onClick={() => navigate('/turnos')} 
                 size="lg"
               >
                 Agendar Nuevo Turno
               </Button>
               
              

           </VStack>
        </Box>
      </SimpleGrid>

    </Box>
  );
};

export default HomePage;