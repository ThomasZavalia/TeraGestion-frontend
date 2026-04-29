import React from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Alert, AlertIcon, Badge, Flex, Input, Select, FormControl, FormLabel, Center, Spinner, Text
} from '@chakra-ui/react';
import { usePagosPaginadosPaciente } from '../../../hooks/usePagosPaginadosPaciente'; 
import Pagination from '../../../components/ui/Pagination'; 

export const TabHistorialPagos = ({ pacienteId }) => { 
  const { 
    items: pagos, totalItems, totalPages, currentPage, loading, error,
    pagina, setPagina, tamanio, setTamanio, desde, setDesde, hasta, setHasta, metodoPago, setMetodoPago 
  } = usePagosPaginadosPaciente(pacienteId);

  const formatFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' });

  if (error) return <Alert status="error"><AlertIcon />Error cargando historial de pagos: {error.message}</Alert>;

  return (
    <Box p={4}>
     
      <Flex gap={4} mb={4} align="flex-end" wrap="wrap" bg="gray.50" p={4} borderRadius="md" borderWidth="1px">
        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Desde</FormLabel>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} bg="white" size="sm"/>
        </FormControl>

        <FormControl w={{ base: '100%', md: '150px' }}>
          <FormLabel fontSize="sm" mb={1}>Hasta</FormLabel>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} bg="white" size="sm"/>
        </FormControl>

        <FormControl w={{ base: '100%', md: '200px' }}>
          <FormLabel fontSize="sm" mb={1}>Método de Pago</FormLabel>
          <Select placeholder="Todos" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} bg="white" size="sm">
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </Select>
        </FormControl>
      </Flex>
  

      {loading ? (
        <Center py={10}><Spinner size="xl" /></Center>
      ) : pagos.length === 0 ? (
        <Alert status="info"><AlertIcon />No se encontraron pagos con estos filtros.</Alert>
      ) : (
        <>
          <TableContainer bg="white" borderRadius="md" shadow="sm" borderWidth="1px">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Fecha y Hora</Th>
                  <Th>Método de Pago</Th>
                  <Th isNumeric>Monto</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagos.map((pago) => (
                  <Tr key={pago.id}>
                    <Td>{formatFecha(pago.fecha)}</Td>
                    <Td>
                      <Badge colorScheme={
                        pago.metodoPago === 'Efectivo' ? 'green' : 
                        pago.metodoPago === 'Transferencia' ? 'blue' : 'purple'
                      }>
                        {pago.metodoPago}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold" color="green.600">
                      ${pago.monto.toLocaleString('es-AR')}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Box mt={4}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={tamanio}
              onPageChange={setPagina}
              onPageSizeChange={(newSize) => { setTamanio(newSize); setPagina(1); }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};