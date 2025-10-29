import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Text, VStack, HStack, Tag, useToast, Box, Divider, IconButton,
  Heading, 
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, Select, FormControl,
   FormLabel,  ButtonGroup,Flex,Tooltip,
} from '@chakra-ui/react';
import { useState,useRef,useEffect } from 'react';
import { format, parseISO,isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiEdit, FiTrash2, FiCheckCircle, FiCheck, FiX } from 'react-icons/fi';
import { turnoService } from '../../../services/TurnoService';
import { sesionService } from '../../../services/SesionService';

const ModalVerTurno = ({ isOpen, onClose, turno, onTurnoUpdate, onEdit, onDelete }) => { 
  const toast = useToast();
  const [isPaying, setIsPaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isSavingAsistencia, setIsSavingAsistencia] = useState(false); 
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(null); 

  const [metodoPago, setMetodoPago] = useState('Efectivo'); 

 
 const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef(); 
 
const turnoData = turno?.extendedProps;
const turnoFecha = turno?.start;

  let fechaFormateada = 'Fecha inválida'; 
  if (turnoData && turnoData.fecha) { 
    try {
     
      const fechaTurno = parseISO(turnoData.fecha); 

      
      if (fechaTurno && !isNaN(fechaTurno.getTime())) { 
        fechaFormateada = format(fechaTurno, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es });
      } else {
         console.error('parseISO devolvió una fecha inválida para:', turnoData.fecha);
      }
    } catch (error) {
       console.error('Error al parsear/formatear la fecha:', error);
    }
  }

 const esTurnoFuturo = turnoFecha ? isFuture(turnoFecha) : false;


const handleMarcarPagado = async () => {
    if (!turnoData) return;
    setIsPaying(true);
    
    const result = await turnoService.marcarComoPagado(turnoData.id, metodoPago); 
    setIsPaying(false);

 
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
      onEdit(turnoData); 
      //onClose(); 
    }
  };

 
  const handleConfirmarEliminar = async () => {
    if (!turnoData) return;
    setIsDeleting(true);
    const result = await turnoService.deleteTurno(turnoData.id);
    setIsDeleting(false);
    onAlertClose(); 

    if (result.success) {
      toast({ title: 'Turno Eliminado', status: 'success', duration: 3000 });
      onDelete(turnoData.id); 
      onClose(); 
    } else {
      toast({ title: 'Error al eliminar', description: result.message, status: 'error', duration: 5000 });
    }
  };

const handleAsistencia = async (estadoAsistencia) => {
    if (!turnoData) return;
    setIsSavingAsistencia(true);
    const result = await sesionService.createSesion(turnoData.id, estadoAsistencia);
    setIsSavingAsistencia(false);

    if (result.success) {
      setAsistenciaRegistrada(estadoAsistencia); 
      toast({
        title: `Asistencia registrada como ${estadoAsistencia}`,
        status: 'success',
        duration: 3000,
      });
     
    } else {
      
       if (result.alreadyExists) {
           setAsistenciaRegistrada(estadoAsistencia); 
       }
       toast({
        title: 'Error al registrar asistencia',
        description: result.message,
        status: result.alreadyExists ? 'warning' : 'error', 
        duration: 5000,
      });
    }
  };



  if (!turnoData) return null;
const showAsistenciaButtons = !asistenciaRegistrada && !esTurnoFuturo;
 return (
    <>
   
      <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside" size="xl"> 
        <ModalOverlay />
        <ModalContent>
         
          <ModalHeader pb={2}>
           
            <Flex justify="space-between" align="center">
             
             <Heading size="md" mr={4}>Detalles del Turno</Heading>
              <HStack spacing={2}>
                <Tooltip label="Editar Turno" fontSize="xs" placement="top">
                 <IconButton 
                    icon={<FiEdit />} 
                    aria-label="Editar Turno" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleEditar} 
                    isDisabled={isPaying || isDeleting || isSavingAsistencia} 
                 />
                 </Tooltip>
                  <Tooltip label="Eliminar Turno" fontSize="xs" placement="top">
                 <IconButton 
                    icon={<FiTrash2 />} 
                    aria-label="Eliminar Turno" 
                    colorScheme="red" 
                    variant="ghost" 
                    size="sm" 
                    mr={10}
                    onClick={onAlertOpen} 
                    isDisabled={isPaying || isDeleting || isSavingAsistencia}
                 />
                  </Tooltip>
              </HStack>
            </Flex>
          </ModalHeader>
         <ModalCloseButton isDisabled={isPaying || isDeleting || isSavingAsistencia} top={4} right={4}/>
          
        
          <ModalBody py={6}> 
            <VStack align="start" spacing={4}> {/* Más spacing */}
              {/* --- Datos Principales --- */}
              <Box>
                <Heading size="sm" color="gray.700">{`${turnoData.pacienteNombre} ${turnoData.pacienteApellido}`}</Heading>
                <Text fontSize="sm" color="gray.500"> {fechaFormateada} </Text>
              </Box>
              <HStack> 
                  <Text fontWeight="medium">Estado Turno:</Text> 
                  <Tag colorScheme={turnoData.estado?.toLowerCase() === 'pagado' ? 'green' : 'blue'}> {turnoData.estado} </Tag> 
              </HStack>
              <HStack> 
                  <Text fontWeight="medium">Precio:</Text> 
                  <Text>${turnoData.precio?.toLocaleString('es-AR') || 'N/A'}</Text> 
              </HStack>
              
              <Divider pt={3}/>

              {/* --- SECCIÓN ASISTENCIA --- */}
              <Box w="full" pt={3}>
                 <Heading size="xs" mb={3} color="gray.600">Registro de Asistencia</Heading>
                 {showAsistenciaButtons ? (
                     <ButtonGroup spacing="3" w="full">
                         <Button leftIcon={<FiCheck />} colorScheme="green" variant="outline" size="sm" onClick={() => handleAsistencia('Presente')} isLoading={isSavingAsistencia} loadingText="Guardando" flex="1"> Confirmar Asistencia </Button>
                         <Button leftIcon={<FiX />} colorScheme="orange" variant="outline" size="sm" onClick={() => handleAsistencia('Ausente')} isLoading={isSavingAsistencia} loadingText="Guardando" flex="1"> Marcar Ausente </Button>
                     </ButtonGroup>
                 ) : (
                    <HStack>
                        <Text fontWeight="medium">Asistencia:</Text>
                        {asistenciaRegistrada ? ( <Tag colorScheme={asistenciaRegistrada === 'Presente' ? 'green' : 'orange'}> {asistenciaRegistrada} </Tag> ) 
                         : ( <Text fontSize="sm" color="gray.500">(Aún no disponible o turno futuro)</Text> )}
                    </HStack>
                 )}
              </Box>
              
              {/* --- SECCIÓN PAGO (SI CORRESPONDE) --- */}
              {/* Solo se muestra si el turno NO está pagado */}
              {turnoData.estado?.toLowerCase() !== 'pagado' && ( 
                 <Box w="full" pt={4} borderTopWidth="1px" borderColor="gray.200" mt={4}>
                     <Heading size="xs" mb={3} color="gray.600">Registrar Pago</Heading>
                     <VStack align="stretch" spacing={3}> 
                        <FormControl id="metodo-pago-ver"> {/* Añadir ID único */}
                            <FormLabel fontSize="sm" mb={1}>Método de Pago</FormLabel>
                            <Select size="sm" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} isDisabled={isPaying}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="MercadoPago">MercadoPago</option>
                                {/* ... más opciones */}
                            </Select>
                        </FormControl>
                        <Button leftIcon={<FiCheckCircle />} colorScheme="green" onClick={handleMarcarPagado} isLoading={isPaying} loadingText="Pagando..." w="full" size="sm">
                            Marcar como Pagado
                        </Button>
                     </VStack>
                 </Box>
             )}

            </VStack>
          </ModalBody>
          
          {/* --- FOOTER SIMPLIFICADO --- */}
          <ModalFooter borderTopWidth="1px" borderColor="gray.200">
             <Button variant="ghost" onClick={onClose} ml="auto" isDisabled={isPaying || isDeleting || isSavingAsistencia}> 
                 Cerrar
             </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* --- AlertDialog (Sin cambios) --- */}
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