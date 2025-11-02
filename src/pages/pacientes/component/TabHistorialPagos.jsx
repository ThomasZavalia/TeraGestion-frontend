import React  from "react";
import {Box, Table, Thead, Tbody, Tr, Th, Td, 
    TableContainer, Alert, AlertIcon,
} from "@chakra-ui/react";



export const TabHistorialPagos = ({pagos}) => {
    if (!pagos || pagos.length === 0) {
        return(
            <Alert status="info" m={4}>
                <AlertIcon />
                No hay pagos registrados para este paciente.
            </Alert>
        );
    }

    const formatFecha = (fechaISO) => {
        return new Date(fechaISO).toLocaleDateString('es-AR', 
        { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
        );
    }



    return(
        <Box p={4}>
        <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Fecha</Th>
                        <Th isNumeric>Monto</Th>
                        <Th>Método de Pago</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {pagos.map((pago) => (
                        <Tr key={pago.id}>
                            <Td>{formatFecha(pago.fecha)}</Td>
                            <Td isNumeric>${pago.monto}</Td>
                            <Td>{pago.metodoPago}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
        </Box>
    )

}
