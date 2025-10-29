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
import { FiCalendar, FiClock, FiDollarSign, FiPlusCircle, FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Para navegar
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

// --- Componente Lista de Turnos de Hoy (Puedes moverlo a /pages/home/components) ---
const TurnosHoyLista = ({ turnos }) => {
  if (turnos.length === 0) {
    return <Text color="gray.500" fontSize="sm">No hay turnos programados para hoy.</Text>;
  }

  // Ordena por hora
  const turnosOrdenados = [...turnos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Usa 'fecha'

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
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Text fontWeight="bold" fontSize="sm">{`${turno.pacienteNombre} ${turno.pacienteApellido}`}</Text>
              <Text fontSize="xs" color="gray.600">
                <ListIcon as={FiClock} color="gray.500" />
                {format(new Date(turno.fecha), 'HH:mm', { locale: es })} hs {/* Usa 'fecha' */}
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
      totalPacientes: '...', // Placeholder
      turnosMesActual: '...' // Placeholder
  }); 
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingTurnos(true);
      setLoadingStats(true); 

      try {
        // --- USA LA NUEVA FUNCIÓN ---
        const turnos = await turnoService.getTurnosDeHoy(); 
        setTurnosHoy(turnos);

        // --- Carga/Calcula otras estadísticas ---
        const ingresos = turnos
            .filter(t => t.estado?.toLowerCase() === 'pagado')
            .reduce((sum, t) => sum + (t.precio || 0), 0);
      
        setStats({ 
            ingresosHoy: ingresos, 
            totalPacientes: 'N/A', // Reemplazar con totalPac
            turnosMesActual: 'N/A' // Reemplazar con turnosMes
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
          title={'Turnos Completados (?)'} 
          stat={loadingStats ? <Spinner size="sm"/> : stats.turnosCompletadosHoy}
          helpText="Estado 'Completado'"
          // icon={FiCheckCircle} // Necesitarías importar este ícono
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
           <Heading size="md" mb={4} color="gray.700">Accesos Rápidos</Heading>
           <VStack spacing={4} align="stretch">
              <Button
                leftIcon={<FiCalendar />}
                colorScheme="blue"
                variant="solid"
                onClick={() => navigate('/turnos')} // Navega a la página de turnos
                size="lg"
              >
                Ver Agenda Completa
              </Button>
               <Button
                leftIcon={<FiPlusCircle />}
                colorScheme="teal"
                variant="outline"
                onClick={() => navigate('/turnos')} // Podrías abrir el modal directamente? (más complejo)
                size="lg"
               >
                 Nuevo Turno
               </Button>
               <Button
                 leftIcon={<FiUserPlus />}
                 colorScheme="purple"
                 variant="outline"
                 onClick={() => navigate('/pacientes')} // Navega a pacientes
                 size="lg"
               >
                 Nuevo Paciente
               </Button>
           </VStack>
        </Box>
      </SimpleGrid>

    </Box>
  );
};

export default HomePage;