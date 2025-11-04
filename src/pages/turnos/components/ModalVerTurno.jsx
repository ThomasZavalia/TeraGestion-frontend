import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Text, VStack, HStack, Tag, useToast, Box, Divider, IconButton,
  Heading, 
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, Select, FormControl,
   FormLabel,  ButtonGroup,Flex,Tooltip,Spinner,Center,
   useColorModeValue,
} from '@chakra-ui/react';
import { useState,useRef,useEffect } from 'react';
import { format, parseISO,isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiEdit, FiTrash2, FiCheckCircle, FiCheck, FiX } from 'react-icons/fi';
import { turnoService } from '../../../services/TurnoService';
import { sesionService } from '../../../services/SesionService';

const ModalVerTurno = ({ isOpen, onClose, turno, onTurnoUpdate, onEdit, onDelete }) => { 
  const toast = useToast();

const [detalle, setDetalle] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const [isPaying, setIsPaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isSavingAsistencia, setIsSavingAsistencia] = useState(false); 
  //const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(null); 

  const [metodoPago, setMetodoPago] = useState('Efectivo'); 

 
 const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef(); 

  const modalBg = useColorModeValue('white', 'gray.800');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const subHeadingColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const inputBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    
    if (isOpen && turno) {
      const fetchDetalle = async () => {
        setIsLoading(true);
        try {
          
          const turnoId = turno.extendedProps.id;
          
          const data = await turnoService.getTurnoDetalle(turnoId);
          
          setDetalle(data); 
        } catch (error) {
          console.error("Error al cargar detalle del turno", error);
          toast({ title: 'Error', description: 'No se pudo cargar el detalle del turno.', status: 'error' });
          setDetalle(null); 
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDetalle();
    }
  }, [isOpen, turno, toast]);
 
const turnoData = turno?.extendedProps;
const turnoFecha = turno?.start;



let fechaFormateada = 'Fecha inválida'; 
  if (detalle && detalle.fechaHora) { 
    try {
      const fechaTurno = parseISO(detalle.fechaHora); 
      fechaFormateada = format(fechaTurno, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es });
    } catch (error) {
       console.error('Error al parsear/formatear la fecha:', error);
    }
  }



 const esTurnoFuturo = detalle ? isFuture(parseISO(detalle.fechaHora)) : false;


const handleMarcarPagado = async () => {
if (!detalle) return;
setIsPaying(true);

const result = await turnoService.marcarComoPagado(detalle.id, metodoPago); 

 if (result.success) {
   toast({ title: 'Turno Pagado', status: 'success' });

 const datosFrescos = await turnoService.getTurnoDetalle(detalle.id);

   onTurnoUpdate(turnoService.formatTurnoForCalendar(datosFrescos)); 
   onClose(); 
   } else {
toast({ title: 'Error al pagar', description: result.message, status: 'error' });
  setIsPaying(false); }
};

  const handleEditar = () => {
    if (detalle) {
      
      onEdit(detalle); 
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
    if (!detalle) return;
    setIsSavingAsistencia(true);
    
    
    const result = await sesionService.registrarAsistencia(detalle.id, estadoAsistencia);
    
    if (result.success) {
      toast({
        title: `Asistencia registrada`,
        status: 'success',
        duration: 3000,
      });
      
      
      const datosFrescos = await turnoService.getTurnoDetalle(detalle.id);
      
    
     onTurnoUpdate(turnoService.formatTurnoForCalendar(datosFrescos));
      onClose(); 
    } else {
      toast({
        title: 'Error al registrar',
        description: result.message,
        status: result.alreadyExists ? 'warning' : 'error', 
      });
    }
    setIsSavingAsistencia(false);
  }




  
  const renderAsistencia = () => {
   
    if (esTurnoFuturo) {
      return <Text fontSize="sm" color="gray.500">(La asistencia se registra el día del turno)</Text>;
    }
    
    
    switch (detalle.asistencia) {
      case 'Presente':
        return <Tag colorScheme='green' size="md"><FiCheckCircle />&nbsp; Asistencia Confirmada</Tag>;
      case 'Ausente':
        return <Tag colorScheme='orange' size="md"><FiX />&nbsp; Ausencia Registrada</Tag>;
      case null: 
      default:
        return (
          <ButtonGroup spacing="3" w="full">
            <Button leftIcon={<FiCheck />} colorScheme="green" variant="outline" size="sm" onClick={() => handleAsistencia('Presente')} isLoading={isSavingAsistencia} loadingText="Guardando" flex="1"> Confirmar Asistencia </Button>
            <Button leftIcon={<FiX />} colorScheme="orange" variant="outline" size="sm" onClick={() => handleAsistencia('Ausente')} isLoading={isSavingAsistencia} loadingText="Guardando" flex="1"> Marcar Ausente </Button>
          </ButtonGroup>
        );
    }
  };
  if (!isOpen) return null;
 return (
    <>
   
     <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside" size="xl"> 
        <ModalOverlay />
        <ModalContent bg={modalBg}> 
          <ModalHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md" mr={4} color={textColor}>Detalles del Turno</Heading> 
              <HStack spacing={1} mr="8">
                 <Tooltip label="Editar Turno" fontSize="xs" placement="top">
                     <IconButton icon={<FiEdit />} aria-label="Editar Turno" variant="ghost" size="sm" onClick={handleEditar} isDisabled={isPaying || isDeleting || isSavingAsistencia} />
                 </Tooltip>
                 <Tooltip label="Eliminar Turno" fontSize="xs" placement="top">
                     <IconButton icon={<FiTrash2 />} aria-label="Eliminar Turno" colorScheme="red" variant="ghost" size="sm" onClick={onAlertOpen} isDisabled={isPaying || isDeleting || isSavingAsistencia} />
                 </Tooltip>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={isPaying || isDeleting || isSavingAsistencia} top={4} right={4}/>
          
        
         <ModalBody py={6}> 

 {isLoading ? (
 <Center h="200px"><Spinner size="xl" /></Center>
 ) : !detalle ? (
 <Center h="200px"><Text color="red.500">Error al cargar datos.</Text></Center>
 ) : (

 <VStack align="start" spacing={4}>
 <Box>
 <Heading size="sm" color="gray.700">{detalle.pacienteNombre}</Heading>
 <Text fontSize="sm" color="gray.500"> {fechaFormateada} </Text>
 </Box>
 <HStack> 
 <Text fontWeight="medium">Estado Turno:</Text> 
 <Tag colorScheme={detalle.estado?.toLowerCase() === 'pagado' ? 'green' : 'blue'}> {detalle.estado} </Tag> 
 </HStack>
 <HStack> 
<Text fontWeight="medium">Precio:</Text> 
 <Text>${detalle.precio?.toLocaleString('es-AR') || 'N/A'}</Text> 
</HStack>

 <Divider pt={3}/>


<Box w="full" pt={3}>
<Heading size="xs" mb={3} color="gray.600">Registro de Asistencia</Heading>
{renderAsistencia()}
 </Box>


{detalle.estado?.toLowerCase() !== 'pagado' && ( 
 <Box w="full" pt={4} borderTopWidth="1px" borderColor="gray.200" mt={4}>
<Heading size="xs" mb={3} color="gray.600">Registrar Pago</Heading>
<VStack align="stretch" spacing={3}> 
<FormControl id="metodo-pago-ver">
 <FormLabel fontSize="sm" mb={1}>Método de Pago</FormLabel>
<Select size="sm" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} isDisabled={isPaying}>
<option value="Efectivo">Efectivo</option>
 <option value="Transferencia">Transferencia</option>
 <option value="MercadoPago">MercadoPago</option>
 </Select>
 </FormControl>
 <Button leftIcon={<FiCheckCircle />} colorScheme="green" onClick={handleMarcarPagado} isLoading={isPaying} loadingText="Pagando..." w="full" size="sm">
Marcar como Pagado
 </Button>
</VStack>
 </Box>
 )}

</VStack>
 )}
</ModalBody>
          
          
          <ModalFooter borderTopWidth="1px" borderColor="gray.200">
             <Button variant="ghost" onClick={onClose} ml="auto" isDisabled={isPaying || isDeleting || isSavingAsistencia}> 
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
          <AlertDialogContent bg={modalBg}> 
            <AlertDialogHeader fontSize="lg" fontWeight="bold"> Eliminar Turno </AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro que deseas eliminar este turno? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}> Cancelar </Button>
              <Button colorScheme="red" onClick={handleConfirmarEliminar} ml={3} isLoading={isDeleting} loadingText="Eliminando...">
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