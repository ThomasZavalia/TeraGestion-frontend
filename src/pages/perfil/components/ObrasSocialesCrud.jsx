import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Center,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  useDisclosure,
  useToast,
    TableContainer,
    Tooltip,
    VStack,
    FormErrorMessage,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { obraSocialService } from '../../../services/ObraSocialService'; 

const ObrasSocialesCRUD = () => {
  const [obrasSociales, setObrasSociales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOS, setSelectedOS] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();

  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const headerBg = useColorModeValue('gray.50', 'gray.700'); 
 
  const modalBg = useColorModeValue('white', 'gray.800'); 
  
  const tableBorder = useColorModeValue('gray.200', 'gray.700');
  
  const emptyText = useColorModeValue('gray.500', 'gray.400');
 
  const inputBg = useColorModeValue('white', 'gray.700');


  const cargarDatos = async () => {
    setIsLoading(true);
    const data = await obraSocialService.getObrasSociales();
    setObrasSociales(data);
    setIsLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

 
  const handleCrear = () => {
    setSelectedOS(null);
    reset({ nombre: '', precioTurno: 0 }); 
    onModalOpen();
  };

 
  const handleEditar = (os) => {
    setSelectedOS(os); 
    reset(os); 
    onModalOpen();
  };

 
  const handleEliminar = (os) => {
    setSelectedOS(os);
    onAlertOpen();
  };


  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
  
    const payload = { ...data, precioTurno: parseFloat(data.precioTurno || 0) };

    try {
      let result;
      if (selectedOS) { 
        
        payload.id = selectedOS.id; 
        result = await obraSocialService.updateObraSocial(selectedOS.id, payload);
      } else { 
        result = await obraSocialService.createObraSocial(payload);
      }

      if (result.success) {
        toast({ title: `Obra Social ${selectedOS ? 'actualizada' : 'creada'}`, status: 'success' });
        onModalClose();
        await cargarDatos(); 
      } else {
        toast({ title: 'Error', description: result.message, status: 'error' });
      }
    } catch (error) {
      toast({ title: 'Error inesperado', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const onConfirmDelete = async () => {
    if (!selectedOS) return;
    setIsSubmitting(true); 
    
    const result = await obraSocialService.deleteObraSocial(selectedOS.id);
    
    if (result.success) {
      toast({ title: 'Obra Social eliminada', status: 'success' });
      onAlertClose();
      await cargarDatos(); 
    } else {
      toast({ title: 'Error', description: result.message, status: 'error' });
    }
    setIsSubmitting(false);
    setSelectedOS(null);
  };

 

  if (isLoading) {
    return <Center h="200px"><Spinner /></Center>;
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text>Gestiona las obras sociales y sus precios.</Text>
        <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" onClick={handleCrear}>
          Nueva Obra Social
        </Button>
      </HStack>

     
    <TableContainer borderWidth="1px" borderRadius="md" borderColor={tableBorder}>
        <Table variant="simple" size="sm">
          {/* --- 4. APLICA COLOR DE FONDO DINÁMICO --- */}
          <Thead bg={headerBg}>
            <Tr>
              <Th>Nombre</Th>
              <Th isNumeric>Precio Turno</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {obrasSociales.length === 0 ? (
              <Tr><Td colSpan={3}><Center p={4} color={emptyText}>No hay obras sociales registradas.</Center></Td></Tr>
            ) : (
              obrasSociales.map((os) => (
                <Tr key={os.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}> 
                  <Td>{os.nombre}</Td>
                  <Td isNumeric>${os.precioTurno?.toLocaleString('es-AR')}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="Editar" fontSize="xs">
                        <IconButton icon={<FiEdit />} size="sm" variant="ghost" onClick={() => handleEditar(os)} />
                      </Tooltip>
                      <Tooltip label="Eliminar" fontSize="xs">
                        <IconButton icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleEliminar(os)} />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

   
     <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onFormSubmit)} bg={modalBg}>
          <ModalHeader>{selectedOS ? 'Editar Obra Social' : 'Nueva Obra Social'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={errors.nombre} isRequired>
                <FormLabel fontSize="sm">Nombre</FormLabel>
                <Input 
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  bg={inputBg} 
                />
                <FormErrorMessage>{errors.nombre?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.precioTurno} isRequired>
                <FormLabel fontSize="sm">Precio del Turno</FormLabel>
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                  <Input 
                    type="number"
                    step="0.01"
                    {...register('precioTurno', { 
                        required: 'El precio es requerido',
                        valueAsNumber: true,
                        min: { value: 0, message: 'El precio no puede ser negativo' }
                    })} 
                    bg={inputBg} 
                  />
                </InputGroup>
                <FormErrorMessage>{errors.precioTurno?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onModalClose}>Cancelar</Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              {selectedOS ? 'Actualizar' : 'Crear'}
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
            <AlertDialogHeader>Eliminar Obra Social</AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro que deseas eliminar "{selectedOS?.nombre}"? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={onConfirmDelete} ml={3} isLoading={isSubmitting}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ObrasSocialesCRUD;