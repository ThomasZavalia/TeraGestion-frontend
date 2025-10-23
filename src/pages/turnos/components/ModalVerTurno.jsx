import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Text, VStack, HStack, Tag, useToast, Box, Divider, IconButton,
  Heading
} from '@chakra-ui/react';
import { useState } from 'react';
import { format, parseISO } from 'date-fns'; // <--- parseISO está importado
import { es } from 'date-fns/locale';
import { FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { turnoService } from '../../../services/TurnoService';

const ModalVerTurno = ({ isOpen, onClose, turno, onTurnoUpdate }) => {
  const toast = useToast();
  const [isPaying, setIsPaying] = useState(false);

  const turnoData = turno?.extendedProps;


  let fechaFormateada = 'Fecha inválida'; 
  if (turnoData && turnoData.fecha) { 
    try {
      // Usamos parseISO en lugar de new Date()
      const fechaTurno = parseISO(turnoData.fecha); 

      // Verificamos si el parseo fue exitoso
      if (fechaTurno && !isNaN(fechaTurno.getTime())) { 
        fechaFormateada = format(fechaTurno, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es });
      } else {
         console.error('parseISO devolvió una fecha inválida para:', turnoData.Fecha);
      }
    } catch (error) {
       console.error('Error al parsear/formatear la fecha:', error);
    }
  }
  // --- FIN DE LA CORRECCIÓN ---


  const handleMarcarPagado = async () => { /* ... (tu código) ... */ };
  const handleEditar = () => console.log("Editar:", turnoData);
  const handleEliminar = () => console.log("Eliminar:", turnoData);

  if (!turnoData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb={2}>Detalles del Turno</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={3}>
            <Heading size="md">{`${turnoData.pacienteNombre} ${turnoData.pacienteApellido}`}</Heading>
            
            {/* --- 2. USAMOS LA VARIABLE FORMATEADA --- */}
            <Text fontSize="sm" color="gray.600">
              {fechaFormateada} 
            </Text>
            {/* --- FIN DEL CAMBIO --- */}

            <HStack>
              <Text fontWeight="medium">Estado:</Text>
              
              <Tag colorScheme={turnoData.estado?.toLowerCase() === 'pagado' ? 'green' : 'blue'}>
                {turnoData.estado}
              </Tag>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Precio:</Text>
              <Text>${turnoData.precio?.toLocaleString('es-AR') || 'N/A'}</Text>
            </HStack>
            <Divider pt={2}/>
            <HStack justifyContent="flex-end" w="full" spacing={2} pt={2}>
               <IconButton icon={<FiEdit />} aria-label="Editar Turno" variant="ghost" onClick={handleEditar}/>
               <IconButton icon={<FiTrash2 />} aria-label="Eliminar Turno" colorScheme="red" variant="ghost" onClick={handleEliminar}/>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
           {/* (Asegúrate que 'estado' venga con minúscula o usa .toLowerCase()) */}
          {turnoData.estado?.toLowerCase() !== 'pagado' && (
            <Button
              leftIcon={<FiCheckCircle />}
              colorScheme="green"
              onClick={handleMarcarPagado}
              isLoading={isPaying}
              loadingText="Pagando..."
              mr={3}
            >
              Marcar como Pagado
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalVerTurno;