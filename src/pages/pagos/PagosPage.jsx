import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  HStack, // Para alinear filtros horizontalmente
  FormControl,
  FormLabel,
  Input, // Usaremos Input type="date"
  Button,
  Spinner,
  Center,
  Text,
  VStack, // Para apilar verticalmente
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi'; // Icono para el botón
import { pagoService } from '../../services/PagosService';
import TablaPagos from './components/TablaPagos'; // El componente tabla que crearemos

const PagosPage = () => {
  // Estados para los filtros
  const [fechaDesde, setFechaDesde] = useState(''); // Guardamos como 'YYYY-MM-DD'
  const [fechaHasta, setFechaHasta] = useState(''); // Guardamos como 'YYYY-MM-DD'
  // const [pacienteIdFiltro, setPacienteIdFiltro] = useState(null); // Para filtro paciente opcional

  // Estado para los datos y carga
  const [pagos, setPagos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar los pagos (se llama al inicio y al filtrar)
  const cargarPagos = async (filtrosAplicados) => {
    setIsLoading(true);
    try {
      const data = await pagoService.getPagos(filtrosAplicados);
      setPagos(data);
    } catch (error) {
      // Manejar error (ej. mostrar toast)
      console.error("Fallo al cargar pagos:", error);
      setPagos([]); // Limpia la tabla en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial al montar la página (sin filtros)
  useEffect(() => {
    cargarPagos({}); // Llama sin filtros la primera vez
  }, []); // Array vacío para ejecutar solo al montar

  // Handler para el botón de filtrar
  const handleFiltrar = () => {
    const filtros = {
      fechaDesde: fechaDesde || null, // Envía null si está vacío
      fechaHasta: fechaHasta || null, // Envía null si está vacío
      // pacienteId: pacienteIdFiltro || null, // Si añades filtro paciente
    };
    cargarPagos(filtros);
  };

  return (
    <Box>
      <Heading mb={6}>Gestión de Pagos</Heading>

      {/* --- Sección de Filtros --- */}
      <HStack spacing={4} mb={6} wrap="wrap"> {/* wrap permite que caigan en pantallas chicas */}
        <FormControl>
          <FormLabel fontSize="sm">Fecha Desde</FormLabel>
          <Input 
            type="date" 
            size="sm" 
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)} 
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Fecha Hasta</FormLabel>
          <Input 
            type="date" 
            size="sm" 
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)} 
          />
        </FormControl>
        {/* Aquí iría el AsyncSelect para Paciente si lo añades */}
        <Button 
          leftIcon={<FiFilter />} 
          colorScheme="blue" 
          size="sm" 
          onClick={handleFiltrar}
          isLoading={isLoading} // Muestra spinner en el botón mientras carga
          alignSelf="flex-end" // Alinea el botón abajo con los inputs
        >
          Filtrar
        </Button>
      </HStack>

      {/* --- Sección de la Tabla --- */}
      <Box bg="white" p={4} borderRadius="md" shadow="md">
        {isLoading ? (
          <Center h="200px">
            <Spinner size="xl" />
          </Center>
        ) : (
          <TablaPagos pagos={pagos} />
        )}
      </Box>
    </Box>
  );
};

export default PagosPage;