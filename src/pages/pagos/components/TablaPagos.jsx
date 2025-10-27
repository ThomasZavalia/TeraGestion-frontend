import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Center, // Para mensaje si no hay datos
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns'; // Para formatear fecha
import { es } from 'date-fns/locale';

const TablaPagos = ({ pagos }) => {
  if (!pagos || pagos.length === 0) {
    return (
      <Center p={10}>
        <Text color="gray.500">No se encontraron pagos con los filtros seleccionados.</Text>
      </Center>
    );
  }

  const formatFecha = (fechaString) => {
      try {
          const fecha = parseISO(fechaString); // Parsea fecha ISO
          return format(fecha, 'dd/MM/yyyy HH:mm', { locale: es });
      } catch (e) {
          return 'Fecha inválida';
      }
  }

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead bg="gray.50">
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
            <Tr key={pago.id}>
              <Td>{formatFecha(pago.fecha)}</Td>
              <Td>{`${pago.pacienteNombre} ${pago.pacienteApellido}`}</Td>
              <Td isNumeric>${pago.monto?.toLocaleString('es-AR') || '-'}</Td>
              <Td>{pago.metodoPago}</Td>
              {/* <Td> Aquí irían los botones de acción </Td> */}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default TablaPagos;