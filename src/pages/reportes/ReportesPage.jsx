
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { reportesService } from '../../services/ReportesService';

import BarChartReport from './components/BarChartReport';
import PieChartReport from './components/PieChartReport';
import HorizontalBarChartReport from './components/HorizontalBarChartReport';

const ReportesPage = () => {

  const [topPacientes, setTopPacientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [turnosEstado, setTurnosEstado] = useState([]);
  const [turnosMes, setTurnosMes] = useState([]);
  const [ingresosMes, setIngresosMes] = useState([]);
  const [turnosObraSocial, setTurnosObraSocial] = useState([]);

 
  const [loading, setLoading] = useState(true);
  const [loadingMes, setLoadingMes] = useState(false); 


  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');


  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [pacientesData, metodosData, estadoData,osData] = await Promise.all([
          reportesService.getTopPacientes(),
          reportesService.getMetodosPago(),
          reportesService.getTurnosPorEstado(),
          reportesService.getTurnosPorObraSocial(),
        ]);
        setTopPacientes(pacientesData);
        setMetodosPago(metodosData);
        setTurnosEstado(estadoData);
        setTurnosObraSocial(osData);
        
        await loadMonthlyData(); 
      } catch (error) {
        console.error("Error cargando reportes iniciales:", error);
       
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  
  }, []); 

   
   const loadMonthlyData = async (currentFilters = { fechaDesde, fechaHasta }) => {
      setLoadingMes(true);
      try {
           const [turnosData, ingresosData] = await Promise.all([
              reportesService.getTurnosPorMes(currentFilters),
              reportesService.getIngresosPorMes(currentFilters),
           ]);
           setTurnosMes(turnosData);
           setIngresosMes(ingresosData);
      } catch (error) {
          console.error("Error cargando reportes mensuales:", error);
        
      } finally {
          setLoadingMes(false);
      }
   };

   const handleFiltrar = () => {
       loadMonthlyData({ fechaDesde, fechaHasta });
   };

   const filterBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');

  return (
    <Box>
      <Heading mb={6}>Reportes</Heading>

   
    <HStack 
        spacing={4} 
        mb={8} 
        wrap="wrap" 
        bg={filterBg} 
        p={4} 
        borderRadius="md" 
        shadow="sm"
        align="flex-end" 
      >
         <FormControl>
           <FormLabel fontSize="sm">Desde Mes</FormLabel>
           <Input 
             type="month" 
             size="sm" 
             value={fechaDesde} 
             onChange={(e) => setFechaDesde(e.target.value)} 
             bg={inputBg} 
            />
         </FormControl>
         <FormControl>
           <FormLabel fontSize="sm">Hasta Mes</FormLabel>
           <Input 
             type="month" 
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
            isLoading={loadingMes}
         >
            Filtrar Meses
         </Button>
      </HStack>

     
      {loading ? (
        <Center h="400px"><Spinner size="xl" /></Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
         
          <BarChartReport
            title="Ingresos por Mes"
            data={ingresosMes}
            dataLabel="Ingresos ($)"
            labelField="mes"
            valueField="valor" 
            isLoading={loadingMes}
            formatValue={(value) => `$ ${value.toLocaleString('es-AR')}`} 
          />

       
          <BarChartReport
            title="Cantidad de Turnos por Mes"
            data={turnosMes}
            dataLabel="Turnos"
            labelField="mes"
            valueField="valor"
            isLoading={loadingMes}
          />

          <HorizontalBarChartReport
             title="Obras Sociales más Usadas"
             data={turnosObraSocial}
             dataLabel="Turnos"
             labelField="estado" 
             valueField="cantidad"
             isLoading={loading}
          />

           
          <PieChartReport
            title="Distribución de Turnos por Estado"
            data={turnosEstado}
            labelField="estado"
            valueField="cantidad"
            isLoading={loading} 
          />

         
          <PieChartReport
            title="Distribución de Métodos de Pago"
            data={metodosPago}
            labelField="metodoPago"
            valueField="cantidad"
            isLoading={loading}
          />
          
         
          <HorizontalBarChartReport
             title="Top 5 Pacientes por Cantidad de Turnos"
             data={topPacientes}
             dataLabel="Cantidad de Turnos"
             labelField="paciente" 
             valueField="turnos"
             isLoading={loading}
          />

          

        </SimpleGrid>
      )}
    </Box>
  );
};

export default ReportesPage;