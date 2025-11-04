import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Center, 
  useColorModeValue,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns'; 
import { es } from 'date-fns/locale';

const TablaPagos = ({ pagos }) => {

  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const emptyText = useColorModeValue('gray.500', 'gray.400');
  const rowBorder = useColorModeValue('gray.200', 'gray.700');

  if (!pagos || pagos.length === 0) {
    return (
      <Center p={10}>
        <Text color="gray.500">No se encontraron pagos con los filtros seleccionados.</Text>
      </Center>
    );
  }

  const formatFecha = (fechaString) => {
      try {
          const fecha = parseISO(fechaString); 
          return format(fecha, 'dd/MM/yyyy HH:mm', { locale: es });
      } catch (e) {
          return 'Fecha inválida';
      }
  }

  return (
   <TableContainer>
      <Table variant="simple" size="sm">
        
        <Thead bg={headerBg}>
          <Tr>
            <Th>Fecha</Th>
            <Th>Paciente</Th>
            <Th isNumeric>Monto</Th>
            <Th>Método de Pago</Th>
            {/* <Th>Acciones</Th> */}
          </Tr>
        </Thead>
        <Tbody>
          {pagos.map((pago) => (
            <Tr key={pago.id} borderBottomWidth="1px" borderColor={rowBorder}>
              <Td>{formatFecha(pago.fecha)}</Td>
              <Td>{`${pago.pacienteNombre} ${pago.pacienteApellido}`}</Td>
              <Td isNumeric>${pago.monto?.toLocaleString('es-AR') || '-'}</Td>
              <Td>{pago.metodoPago}</Td>
              
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default TablaPagos;