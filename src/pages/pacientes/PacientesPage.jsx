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
} from '@chakra-ui/react';
import { AddIcon } from "@chakra-ui/icons"; 
import { FiFilter } from "react-icons/fi";
import { useLocation,useNavigate } from 'react-router-dom';
import { usePacientes } from '../../hooks/usePacientes';
import { TablaPacientes } from './component/TablaPacientes';
import { FormularioPacienteModal } from './component/FormularioPacienteModal';
import { ComfirmarEliminarModal } from './component/ComfirmarEliminarModal';
import { obraSocialService } from '../../services/ObraSocialService';

const PacientesPage = () => {

  const { pacientes, loading, error, recargarPacientes, eliminarPaciente } = usePacientes();
  const toast = useToast();

 
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
    recargarPacientes();
  };

  

  
  const handleEliminar = (paciente) => {
    setPacienteAEliminar(paciente); 
    onAlertOpen(); 
  };

  const confirmarEliminar = async () => {
    setIsEliminando(true);
    try {
      await eliminarPaciente(pacienteAEliminar.id);
      toast({
        title: "Paciente eliminado",
        status: "success",
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
        setFiltros({ obraSocialId: '', activo: '', tienePagosPendientes: '' }); 
        recargarPacientes({}); 
        onFilterClose();
    };

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

  return <TablaPacientes pacientes={pacientes} onEditar={handleEditar} onEliminar={handleEliminar} />;
  };

 return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={10}>
        <Heading>Pacientes</Heading>
        <HStack>
          {/* --- BOTÓN DE FILTRO AÑADIDO --- */}
          <Tooltip label="Filtrar Pacientes" aria-label="Filtrar Pacientes">
            <IconButton
              icon={<FiFilter />}
              aria-label="Filtrar Pacientes"
              variant="outline"
              onClick={onFilterOpen} 
            />
          </Tooltip>
         
          <Tooltip label="Agregar Paciente" aria-label="Agregar Paciente">
            <Button leftIcon={<AddIcon />} colorScheme='teal' onClick={handleNuevo}>
              Agregar Paciente
            </Button>
          </Tooltip>
        </HStack>
      </HStack>

      <Box>
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
        title="Eliminar Paciente" 
      >

                ¿Estás seguro? Se eliminará a <strong> {pacienteAEliminar?.nombre} {pacienteAEliminar?.apellido}</strong>.

      
      </ComfirmarEliminarModal>


<Drawer isOpen={isFilterOpen} placement="right" onClose={onFilterClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filtrar Pacientes</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4}>
              {/* Filtro por Obra Social */}
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
                  {/* --- 2. ERROR 'key' y DATOS CORREGIDO --- */}
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