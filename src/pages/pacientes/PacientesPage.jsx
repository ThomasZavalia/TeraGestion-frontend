import React, { useState, useRef,useEffect } from 'react'; 
import {
  Box,
  Heading,
  Button,
  IconButton, 
  HStack,
  VStack,
  Select, 
  FormControl,
  FormLabel,
  Spinner,
  Center,
  Text,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure, 
  Tooltip,
  Alert,AlertIcon,
  Input,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon} from "@chakra-ui/icons"; 
import { FiFilter } from "react-icons/fi";
import { useLocation,useNavigate } from 'react-router-dom';
import { usePacientes } from '../../hooks/usePacientes';
import { TablaPacientes } from './component/TablaPacientes';
import { FormularioPacienteModal } from './component/FormularioPacienteModal';
import { ComfirmarEliminarModal } from './component/ComfirmarEliminarModal';
import { pacienteService } from '../../services/PacienteService/PacienteService';
import { obraSocialService } from '../../services/ObraSocialService';

const PacientesPage = () => {

  const { pacientes, loading, error, recargarPacientes, eliminarPaciente } = usePacientes();
  const toast = useToast();

  const [busqueda, setBusqueda] = useState('');
 
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const [pacienteActual, setPacienteActual] = useState(null);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [isEliminando, setIsEliminando] = useState(false);
  const cancelRef = useRef();

  const location = useLocation(); 
  const navigate = useNavigate();

  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
 const [filtros, setFiltros] = useState({ obraSocialId: '', activo: '', tienePagosPendientes: '' });
  const [obrasSociales, setObrasSociales] = useState([]);
  const [isLoadingOS, setIsLoadingOS] = useState(false);


  useEffect(() => {
    const cargarObrasSociales = async () => {
        setIsLoadingOS(true);
        const data = await obraSocialService.getObrasSociales();
        setObrasSociales(data);
        setIsLoadingOS(false);
    };
    cargarObrasSociales();
  }, []);

  useEffect(() => {
     recargarPacientes({ activo: 'true' }); 
  }, [recargarPacientes]);

  useEffect(() => {
    
    if (location.state?.abrirModalNuevo) {
      console.log("Detectado 'abrirModalNuevo' desde el Home.");
      handleNuevo(); 
      
   
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location.state]);

  const handleNuevo = () => {
    setPacienteActual(null);
    onFormOpen(); 
  };

  const handleEditar = (paciente) => {
    setPacienteActual(paciente);
    onFormOpen(); 
  };

  const handleGuardado = () => {
    onFormClose(); 
    recargarPacientes(filtros);
  };

  

  
  const handleEliminar = (paciente) => {
    setPacienteAEliminar(paciente); 
    onAlertOpen(); 
  };

  const handleReactivar = async (paciente) => {
      
      try {
          await pacienteService.actualizarPaciente(paciente.id, { ...paciente, activo: true });
          toast({ title: "Paciente Reactivado", status: "success", duration: 3000 });
          recargarPacientes(filtros);
      } catch (error) {
          toast({ title: "Error al reactivar", description: error.message, status: "error" });
      }
  };

 const confirmarEliminar = async () => {
    setIsEliminando(true);
    try {
      
      await eliminarPaciente(pacienteAEliminar.id); 
      toast({
        title: "Paciente Desactivado", 
        status: "warning", 
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar el paciente",
        description: error.message, 
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsEliminando(false);
      onAlertClose();
      setPacienteAEliminar(null);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleAplicarFiltros = () => {
    recargarPacientes(filtros); 
    onFilterClose(); 
  };

 const handleLimpiarFiltros = () => {
        setFiltros({ obraSocialId: '', activo: 'true', tienePagosPendientes: '' }); 
        recargarPacientes({activo:'true'}); 
        onFilterClose();
    };

    const boxBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');

  const pacientesFiltrados = pacientes.filter((paciente) => {
      const termino = busqueda.toLowerCase();
      return (
          paciente.nombre.toLowerCase().includes(termino) ||
          paciente.apellido.toLowerCase().includes(termino) ||
          paciente.dni.toLowerCase().includes(termino)
      );
  });

  const contenido = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={10}>
          <Spinner size="xl" />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert status='error'>
          <AlertIcon />
          Error al cargar los pacientes.
        </Alert>
      );
    }

  return <TablaPacientes pacientes={pacientesFiltrados} onEditar={handleEditar} onEliminar={handleEliminar} onReactivar={handleReactivar} />;
  };

 return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={10}>
        <Heading>Pacientes</Heading>
        <HStack>
        
          <Tooltip label="Filtrar Pacientes" aria-label="Filtrar Pacientes">
            <IconButton
              icon={<FiFilter />}
              aria-label="Filtrar Pacientes"
              variant="outline"
              onClick={onFilterOpen} 
               onFocus={(e) => e.preventDefault()}
            />
          </Tooltip>
         
          <Tooltip label="Agregar Paciente" aria-label="Agregar Paciente">
            <Button leftIcon={<AddIcon />} colorScheme='teal' onClick={handleNuevo}  onFocus={(e) => e.preventDefault()}>
              Agregar Paciente
            </Button>
          </Tooltip>
        </HStack>
      </HStack>

     <Input 
          placeholder="Buscar en la lista por nombre, apellido o DNI..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          mb={4}
          bg={inputBg}
      />
      

      <Box bg={boxBg} p={4} borderRadius="md" shadow="md"> 
        {contenido()}
      </Box>

      
     <FormularioPacienteModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        onGuardado={handleGuardado}
        pacienteAEditar={pacienteActual}
      />

     <ComfirmarEliminarModal
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onConfirm={confirmarEliminar}
        isLoading={isEliminando}
        leastDestructiveRef={cancelRef} 
        title="Desactivar Paciente" 
      >

      ¿Estás seguro? El paciente **{pacienteAEliminar?.nombre} {pacienteAEliminar?.apellido}** se marcará como "Inactivo" y no aparecerá en las búsquedas.
      </ComfirmarEliminarModal>


<Drawer isOpen={isFilterOpen} placement="right" onClose={onFilterClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filtrar Pacientes</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4}>
              
              <FormControl>
                <FormLabel fontSize="sm">Obra Social</FormLabel>
                <Select
                  name="obraSocialId"
                  value={filtros.obraSocialId}
                  onChange={handleFiltroChange}
                  placeholder={isLoadingOS ? "Cargando..." : "Todas"} 
                  size="sm"
                 
                  isDisabled={isLoadingOS} 
                >
                
                  {!isLoadingOS && obrasSociales.map(os => (
                   
                    <option key={os.value} value={os.value}> 
                      {os.label}
                    </option>
                  ))}
                 
                </Select>
              </FormControl>
              
             
              <FormControl>
                <FormLabel fontSize="sm">Estado</FormLabel>
                <Select
                  name="activo"
                  value={filtros.activo}
                  onChange={handleFiltroChange}
                  placeholder="Todos"
                  size="sm"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </Select>
              </FormControl>

              <FormControl>
                             <FormLabel fontSize="sm">Pagos</FormLabel>
                                <Select
                                  name="tienePagosPendientes"
                                  value={filtros.tienePagosPendientes}
                                  onChange={handleFiltroChange}
                                  placeholder="Todos"
                                  size="sm"
                                >
                                    <option value="true">Con pagos pendientes</option>
                                    <option value="false">Sin pagos pendientes</option>
                                </Select>
                            </FormControl>

            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={handleLimpiarFiltros} size="sm">
              Limpiar
            </Button>
            <Button colorScheme="blue" onClick={handleAplicarFiltros} size="sm">
              Aplicar Filtros
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
    </Box>
  );
};

export default PacientesPage;