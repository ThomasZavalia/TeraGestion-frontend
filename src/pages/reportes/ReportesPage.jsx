// Ejemplo para: /src/pages/pacientes/PacientesPage.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  HStack, // Para filtros
  FormControl,
  FormLabel,
  Input,
  Button
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { reportesService } from '../../services/ReportesService';

import BarChartReport from './components/BarChartReport';
import PieChartReport from './components/PieChartReport';
import HorizontalBarChartReport from './components/HorizontalBarChartReport';

const ReportesPage = () => {
  // Estados para cada reporte
  const [topPacientes, setTopPacientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [turnosEstado, setTurnosEstado] = useState([]);
  const [turnosMes, setTurnosMes] = useState([]);
  const [ingresosMes, setIngresosMes] = useState([]);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [loadingMes, setLoadingMes] = useState(false); // Carga específica para filtros

  // Estados para filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Carga inicial de datos (excepto los mensuales)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [pacientesData, metodosData, estadoData] = await Promise.all([
          reportesService.getTopPacientes(),
          reportesService.getMetodosPago(),
          reportesService.getTurnosPorEstado(),
        ]);
        setTopPacientes(pacientesData);
        setMetodosPago(metodosData);
        setTurnosEstado(estadoData);
        // Carga los mensuales sin filtro la primera vez
        await loadMonthlyData(); 
      } catch (error) {
        console.error("Error cargando reportes iniciales:", error);
        // Mostrar toast de error general?
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carga solo al montar

   // Función para cargar/recargar datos mensuales (con filtros)
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
          // Mostrar toast?
      } finally {
          setLoadingMes(false);
      }
   };

   const handleFiltrar = () => {
       loadMonthlyData({ fechaDesde, fechaHasta });
   };

  return (
    <Box>
      <Heading mb={6}>Reportes</Heading>

      {/* --- Filtros para reportes mensuales --- */}
      <HStack spacing={4} mb={8} wrap="wrap" bg="white" p={4} borderRadius="md" shadow="sm">
         <FormControl>
           <FormLabel fontSize="sm">Desde Mes</FormLabel>
           <Input type="month" size="sm" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
         </FormControl>
         <FormControl>
           <FormLabel fontSize="sm">Hasta Mes</FormLabel>
           <Input type="month" size="sm" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
         </FormControl>
         <Button 
            leftIcon={<FiFilter />} 
            colorScheme="blue" 
            size="sm" 
            onClick={handleFiltrar}
            isLoading={loadingMes}
            alignSelf="flex-end"
         >
            Filtrar Meses
         </Button>
      </HStack>

      {/* --- Cuadrícula de Gráficos --- */}
      {loading ? (
        <Center h="400px"><Spinner size="xl" /></Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Ingresos por Mes */}
          <BarChartReport
            title="Ingresos por Mes"
            data={ingresosMes}
            dataLabel="Ingresos ($)"
            labelField="mes"
            valueField="valor" // Asume que el backend ahora devuelve decimal o ya lo casteaste
            isLoading={loadingMes}
            formatValue={(value) => `$ ${value.toLocaleString('es-AR')}`} // Formato moneda
          />

          {/* Turnos por Mes */}
          <BarChartReport
            title="Cantidad de Turnos por Mes"
            data={turnosMes}
            dataLabel="Turnos"
            labelField="mes"
            valueField="valor"
            isLoading={loadingMes}
          />

           {/* Turnos por Estado */}
          <PieChartReport
            title="Distribución de Turnos por Estado"
            data={turnosEstado}
            labelField="estado"
            valueField="cantidad"
            isLoading={loading} // Usa el loading general
          />

          {/* Métodos de Pago */}
          <PieChartReport
            title="Distribución de Métodos de Pago"
            data={metodosPago}
            labelField="metodoPago"
            valueField="cantidad"
            isLoading={loading}
          />
          
          {/* Top Pacientes */}
          <HorizontalBarChartReport
             title="Top 5 Pacientes por Cantidad de Turnos"
             data={topPacientes}
             dataLabel="Cantidad de Turnos"
             labelField="paciente" // El nombre completo
             valueField="turnos"
             isLoading={loading}
          />

          {/* Puedes añadir más gráficos aquí */}

        </SimpleGrid>
      )}
    </Box>
  );
};

export default ReportesPage;