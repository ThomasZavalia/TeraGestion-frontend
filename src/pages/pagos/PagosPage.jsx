import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  HStack, 
  FormControl,
  FormLabel,
  Input, 
  Button,
  Spinner,
  Center,
  Text,
  VStack, 
  useColorModeValue,
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi'; 
import { pagoService } from '../../services/PagosService';
import TablaPagos from './components/TablaPagos'; 

const PagosPage = () => {

  const [fechaDesde, setFechaDesde] = useState(''); 
  const [fechaHasta, setFechaHasta] = useState(''); 
  


  const [pagos, setPagos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

 
  const cargarPagos = async (filtrosAplicados) => {
    setIsLoading(true);
    try {
      const data = await pagoService.getPagos(filtrosAplicados);
      setPagos(data);
    } catch (error) {
     
      console.error("Fallo al cargar pagos:", error);
      setPagos([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos({});
  }, []);

  
  const handleFiltrar = () => {
    const filtros = {
      fechaDesde: fechaDesde || null, 
      fechaHasta: fechaHasta || null, 
     
    };
    cargarPagos(filtros);
  };

  const boxBg = useColorModeValue('white', 'gray.800'); 
  const inputBg = useColorModeValue('white', 'gray.700'); 

  return (
   <Box>
      <Heading mb={6}>Gestión de Pagos</Heading>

     
      <Box bg={boxBg} p={4} borderRadius="md" shadow="sm" mb={6}>
        <HStack spacing={4} wrap="wrap" align="flex-end"> 
          <FormControl>
            <FormLabel fontSize="sm">Fecha Desde</FormLabel>
            <Input 
              type="date" 
              size="sm" 
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              bg={inputBg} 
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Fecha Hasta</FormLabel>
            <Input 
              type="date" 
              size="sm" 
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)} 
              bg={inputBg} 
            />
          </FormControl>
          <Button 
            leftIcon={<FiFilter />} 
            colorScheme="blue" 
            size="sm" 
            onClick={handleFiltrar}
            isLoading={isLoading} 
          >
            Filtrar
          </Button>
        </HStack>
      </Box>

     
      <Box bg={boxBg} p={4} borderRadius="md" shadow="md">
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