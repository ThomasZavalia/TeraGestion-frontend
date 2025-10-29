import React from "react";
import {
    Table, Thead, Tbody, Tr, Th, Td, 
    TableContainer, IconButton, HStack, Tooltip} from "@chakra-ui/react";

import {EditIcon, ViewIcon, DeleteIcon} from "@chakra-ui/icons";


export const TablaPacientes = ({pacientes, onEditar, onEliminar}) => {
    return (
        <TableContainer>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Dni</Th>
                        <Th>Telefono</Th>
                        <Th>Fecha de Nacimiento</Th>
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
                            <Td>{paciente.fechaNacimiento? new Date(paciente.fechaNacimiento).toLocaleDateString('es-AR') : 'N/A'}</Td>
                            <Td>{paciente.obraSocial ? paciente.obraSocial.nombre : "No tiene obra social"}</Td>
                            <Td>
                                <HStack spacing={2}>

                                    <Tooltip label="Editar Paciente" aria-label="Editar Paciente">
                                        <IconButton icon={<EditIcon />}
                                            aria-label="Editar Paciente"
                                            onClick={() => onEditar(paciente)}
                                        >
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip label="Ver Detalles del Paciente" aria-label="Ver Detalles del Paciente">
                                        <IconButton icon={<ViewIcon />}
                                            aria-label="Ver Detalles del Paciente"
                                            >{/** falta el onclick */}
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip label="Eliminar Paciente" aria-label="Eliminar Paciente">
                                        <IconButton icon={<DeleteIcon />}
                                            aria-label="Eliminar Paciente"
                                            onClick={() => onEliminar(paciente)}
                                        >
                                        </IconButton>
                                    </Tooltip>
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}