import React, { useEffect,useF } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, VStack, useToast, Select,
  useColorModeValue,FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from 'react-hook-form';
import { pacienteService } from "../../../services/PacienteService/PacienteService";
import { obraSocialService } from '../../../services/ObraSocialService';


const FormularioInicial = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email:"",
  obraSocialId: "", 
  fechaNacimiento: "",
};

export const FormularioPacienteModal = ({ isOpen, onClose, onGuardado, pacienteAEditar }) => {
  const [formData, setFormData] = React.useState(FormularioInicial);
  const [isSaving, setSaving] = React.useState(false);
  const [obrasSociales, setObrasSociales] = React.useState([]);
  

  const [isLoadingOS, setIsLoadingOS] = React.useState(false); 
  
  const toast = useToast();

  const manejarCambio = !!pacienteAEditar; 

  const today = new Date().toISOString().split('T')[0];

  
  useEffect(() => {
    if (manejarCambio && pacienteAEditar) { 
      const fechaParaInput = pacienteAEditar.fechaNacimiento ? pacienteAEditar.fechaNacimiento.split('T')[0] : '';
      setFormData({
        nombre: pacienteAEditar.nombre || "",
        apellido: pacienteAEditar.apellido || "",
        dni: pacienteAEditar.dni || "",
        telefono: pacienteAEditar.telefono || "",
        email: pacienteAEditar.email || "", 
        obraSocialId: pacienteAEditar.obraSocialId || "",
        fechaNacimiento: fechaParaInput,
      });
    } else {
      setFormData(FormularioInicial); // Resetea
    }
  }, [pacienteAEditar, manejarCambio]);

  useEffect(() => {
    if (isOpen) {
      const cargarObrasSociales = async () => {
        setIsLoadingOS(true);
        try {
         const lista = await obraSocialService.getObrasSocialesActivas();
          setObrasSociales(lista);
        } catch (error) {
          console.error("Error cargando lista de OS", error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar las Obras Sociales.',
            status: 'error',
            duration: 3000,
          });
        } finally {
          setIsLoadingOS(false);
        }
      };
      cargarObrasSociales();
    }
  }, [isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleSubmit = async () => {
    setSaving(true);

    const datosParaEnviar = {
      ...formData,
      
      obraSocialId: formData.obraSocialId ? parseInt(formData.obraSocialId, 10) : null,
      
      fechaNacimiento: formData.fechaNacimiento || null, 
     
      telefono: formData.telefono || null, 
      
      email: formData.email || null, 
    };

    console.log("Datos que se van a enviar:", datosParaEnviar);

    try {
      if (manejarCambio) {
        await pacienteService.actualizarPaciente(pacienteAEditar.id, datosParaEnviar);
      } else {
        await pacienteService.crearPaciente(datosParaEnviar);
      }

      toast({
        title: 'Éxito',
        description: `Paciente ${manejarCambio ? 'actualizado' : 'creado'} correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onGuardado(); 
      onClose(); 
    } catch (error) {
     
      const errorMsg = error.response?.data?.title || error.response?.data?.message || error.message;
      toast({
        title: 'Error',
        description: `No se pudo guardar el paciente: ${errorMsg}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const modalBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{manejarCambio ? 'Editar Paciente' : 'Nuevo Paciente'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>

                        <FormLabel>Nombre</FormLabel>

                        <Input name="nombre" value={formData.nombre} onChange={handleChange}/>

                    </FormControl>

                    <FormControl isRequired>

                        <FormLabel>Apellido</FormLabel>

                        <Input name="apellido" value={formData.apellido} onChange={handleChange}/>

                    </FormControl>

                    <FormControl isRequired>

                        <FormLabel>DNI</FormLabel>

                        <Input name="dni" value={formData.dni} onChange={handleChange}/>

                    </FormControl>

                   <FormControl> 

              <FormLabel>Teléfono</FormLabel>
              <Input name="telefono" value={formData.telefono} onChange={handleChange} bg={inputBg} />
            </FormControl>
            
            <FormControl> 
              <FormLabel>Email</FormLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} bg={inputBg} />
            </FormControl>

                    <FormControl>
              <FormLabel>Fecha de Nacimiento</FormLabel>
              <Input name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} type="date" max={today} bg={inputBg}/>
            </FormControl>

           <FormControl>
              <FormLabel>Obra Social</FormLabel>
              <Select
                name="obraSocialId" 
                value={formData.obraSocialId || ""} 
                onChange={handleChange}
                
                placeholder="Sin Obra Social / Particular" 
                isDisabled={isLoadingOS}
                bg={inputBg}
              >
                
                {obrasSociales.map((os) => (
                  <option key={os.value} value={os.value}>
                    {os.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={isSaving}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};