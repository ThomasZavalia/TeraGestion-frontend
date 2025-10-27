import React, { useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, VStack, useToast, Select
} from "@chakra-ui/react";
import { pacienteService } from "../../../services/PacienteService/PacienteService";
import { obraSocialService } from "../../../services/PacienteService/ObraSocialService"; 


const FormularioInicial = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  obraSocialId: "", 
};

export const FormularioPacienteModal = ({ isOpen, onClose, onGuardado, pacienteAEditar }) => {
  const [formData, setFormData] = React.useState(FormularioInicial);
  const [isSaving, setSaving] = React.useState(false);
  const [obrasSociales, setObrasSociales] = React.useState([]);
  

  const [isLoadingOS, setIsLoadingOS] = React.useState(false); 
  
  const toast = useToast();

  const manejarCambio = !!pacienteAEditar; 

  
  useEffect(() => {
    if (manejarCambio && pacienteAEditar) { 
      setFormData({
        nombre: pacienteAEditar.nombre || "",
        apellido: pacienteAEditar.apellido || "",
        dni: pacienteAEditar.dni || "",
        telefono: pacienteAEditar.telefono || "",
        obraSocialId: pacienteAEditar.obraSocialId || "" 
      });
    } else {
      setFormData(FormularioInicial);
    }
  }, [pacienteAEditar, manejarCambio]);

  useEffect(() => {
    if (isOpen) {
      const cargarObrasSociales = async () => {
        setIsLoadingOS(true);
        try {
          const lista = await obraSocialService.getAll(); 
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

      obraSocialId: formData.obraSocialId ? parseInt(formData.obraSocialId, 10) : null
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
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

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

                    <FormControl isRequired>

                        <FormLabel>Telefono</FormLabel>

                        <Input name="telefono" value={formData.telefono} onChange={handleChange}/>

                    </FormControl>
            <FormControl>
              <FormLabel>Obra Social</FormLabel>
              <Select
                name="obraSocialId" 
                value={formData.obraSocialId || ""} 
                onChange={handleChange}
                placeholder="Seleccione una obra social"
                isDisabled={isLoadingOS}
              >
                {obrasSociales.map((os) => (
                  <option key={os.id} value={os.id}>
                    {os.nombre}
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