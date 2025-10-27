import React from "react";
import {
    Table, Thead, Tbody, Tr, Th, Td, 
    TableContainer, IconButton, HStack,} from "@chakra-ui/react";

import {EditIcon, ViewIcon} from "@chakra-ui/icons";


export const TablaPacientes = ({pacientes, onEditar}) => {
    return (
        <TableContainer>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Dni</Th>
                        <Th>Telefono</Th>
                        <Th>Obra Social</Th>
                        <Th>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {pacientes.map((paciente) => (
                        <Tr key={paciente.id}>
                            <Td>{paciente.nombre} {paciente.apellido}</Td>
                            <Td>{paciente.dni}</Td>
                            <Td>{paciente.telefono}</Td>
                            <Td>{paciente.obraSocialNombre}</Td>
                            <Td>
                                <HStack spacing={2}>
                                    <IconButton icon={<EditIcon />}
                                        aria-label="Editar Paciente"
                                        onClick={() => onEditar(paciente)}
                                    >
                                    </IconButton>

                                    <IconButton icon={<ViewIcon />}
                                        aria-label="Ver Detalles del Paciente"
                                        >{/** falta el onclick */}

                                    </IconButton>
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}