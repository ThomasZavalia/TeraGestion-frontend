import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Text, VStack, HStack, Tag, useToast, Box, Divider, IconButton,
  Heading, 
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, Select, FormControl, FormLabel // <-- AÑADE ESTOS
} from '@chakra-ui/react';
import { useState,useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { turnoService } from '../../../services/TurnoService';

const ModalVerTurno = ({ isOpen, onClose, turno, onTurnoUpdate, onEdit, onDelete }) => { 
  const toast = useToast();
  const [isPaying, setIsPaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [metodoPago, setMetodoPago] = useState('Efectivo'); // Valor por defecto

 
 const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef(); // <-- Y esto también
  // ------------------------------------------------
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
         console.error('parseISO devolvió una fecha inválida para:', turnoData.fecha);
      }
    } catch (error) {
       console.error('Error al parsear/formatear la fecha:', error);
    }
  }
  // --- FIN DE LA CORRECCIÓN ---


const handleMarcarPagado = async () => {
    if (!turnoData) return;
    setIsPaying(true);
    // Pasamos el método de pago seleccionado
    const result = await turnoService.marcarComoPagado(turnoData.id, metodoPago); 
    setIsPaying(false);

    // 5. Muestra feedback y actualiza
    if (result.success) {
      toast({
        title: 'Turno Pagado',
        status: 'success',
        duration: 3000,
      });
     
      onTurnoUpdate({ ...turnoData, estado: 'pagado' }); 
      onClose(); // Cierra el modal
    } else {
      toast({
        title: 'Error al pagar',
        description: result.message,
        status: 'error',
        duration: 5000,
      });
    }
  };
 const handleEditar = () => {
    if (turnoData) {
      onEdit(turnoData); // Llama al padre pasándole los datos del turno
      onClose(); // Cierra este modal
    }
  };

 // --- NUEVO: Handler para Confirmar Eliminación ---
  const handleConfirmarEliminar = async () => {
    if (!turnoData) return;
    setIsDeleting(true);
    const result = await turnoService.deleteTurno(turnoData.id);
    setIsDeleting(false);
    onAlertClose(); 

    if (result.success) {
      toast({ title: 'Turno Eliminado', status: 'success', duration: 3000 });
      onDelete(turnoData.id); 
      onClose(); // Cierra el modal principal
    } else {
      toast({ title: 'Error al eliminar', description: result.message, status: 'error', duration: 5000 });
    }
  };

  if (!turnoData) return null;

  return (
    <>
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
              <IconButton 
                    icon={<FiEdit />} 
                    aria-label="Editar Turno" 
                    variant="ghost" 
                    onClick={handleEditar} // <-- Llama a handleEditar
                 />
                 <IconButton 
                    icon={<FiTrash2 />} 
                    aria-label="Eliminar Turno" 
                    colorScheme="red" 
                    variant="ghost" 
                    onClick={onAlertOpen} // <-- Abre el diálogo de confirmación
                 />
            </HStack>
          </VStack>
        </ModalBody>
      <ModalFooter>
          {/* --- Solo mostrar si el turno NO está pagado --- */}
          {turnoData.estado?.toLowerCase() !== 'pagado' && (
            <VStack align="stretch" w="full"> {/* Usamos VStack para apilar */}
              {/* --- 2. AÑADIMOS EL SELECT --- */}
              <FormControl>
                <FormLabel fontSize="sm">Método de Pago</FormLabel>
                <Select 
                  size="sm" 
                  value={metodoPago} 
                  onChange={(e) => setMetodoPago(e.target.value)}
                  isDisabled={isPaying} // Deshabilitar mientras se procesa
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="MercadoPago">MercadoPago</option>
                  {/* Agrega más opciones si necesitas */}
                </Select>
              </FormControl>
              
              {/* --- El botón ahora está dentro del VStack --- */}
              <Button
                leftIcon={<FiCheckCircle />}
                colorScheme="green"
                onClick={handleMarcarPagado}
                isLoading={isPaying}
                loadingText="Pagando..."
                w="full" // Ocupa todo el ancho
              >
                Marcar como Pagado
              </Button>
            </VStack>
          )}
          <Button variant="ghost" onClick={onClose} ml={turnoData.estado?.toLowerCase() !== 'pagado' ? 0 : 3}> {/* Ajuste de margen */}
             Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Turno
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro que deseas eliminar este turno? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleConfirmarEliminar} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Eliminando..."
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    </>
  );
};

export default ModalVerTurno;