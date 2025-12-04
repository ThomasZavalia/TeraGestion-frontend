import { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack,
  Button, Input, FormControl, FormLabel, Select,
  SimpleGrid, useToast, Divider, Card, CardBody,FormErrorMessage
} from '@chakra-ui/react';
import { publicService } from '../../services/PublicService';

const ReservaPage = () => {
  
  const [step, setStep] = useState(1);
  
 
  const [fecha, setFecha] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni: '', email: '', telefono: '', obraSocialId: ''
  });


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  
  useEffect(() => {
    publicService.getObrasSociales().then(setObrasSociales);
  }, []);

 
 const handleFechaChange = async (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    setHorarios([]);
    setHoraSeleccionada(null);

    if (nuevaFecha) {
      setLoading(true);
      try {
        const dateObj = new Date(nuevaFecha);
        const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
        
        const slots = await publicService.getDisponibilidad(adjustedDate);
        setHorarios(slots);
      } catch (error) {
        toast({ title: "Error al cargar horarios", status: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

 const handleHoraClick = (hora) => {
    setHoraSeleccionada(hora);
    setErrors({}); 
    setStep(2); 
  };

  
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es requerido.";
    if (!formData.apellido.trim()) nuevosErrores.apellido = "El apellido es requerido.";
    
    // Validación DNI: Solo números, 7 u 8 dígitos
    if (!formData.dni) {
        nuevosErrores.dni = "El DNI es requerido.";
    } else if (!/^[0-9]{7,8}$/.test(formData.dni)) {
        nuevosErrores.dni = "El DNI debe tener 7 u 8 números.";
    }

    if (!formData.email) {
        nuevosErrores.email = "El email es requerido.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        nuevosErrores.email = "Formato de email inválido.";
    }

    if (!formData.obraSocialId) nuevosErrores.obraSocialId = "Seleccione una opción.";

    setErrors(nuevosErrores);
    
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validarFormulario()) {
        toast({
            title: "Datos inválidos",
            description: "Por favor revisa los campos en rojo.",
            status: "warning",
            duration: 3000
        });
        return;
    }

    setLoading(true);
    try {
      const fechaCompleta = `${fecha}T${horaSeleccionada}:00`;
      
      const payload = {
        fechaHora: new Date(fechaCompleta).toISOString(),
        ...formData,
        obraSocialId: formData.obraSocialId ? parseInt(formData.obraSocialId) : null
      };

      await publicService.reservar(payload);
      setStep(3); // Éxito
    } catch (error) {
      
      console.error(error);
      
      
      const mensajeBackend = error.response?.data?.error || "Ocurrió un error al reservar.";

      toast({ 
          title: "No se pudo reservar", 
          description: mensajeBackend, 
          status: "error",
          duration: 5000,
          isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <Container maxW="md" py={10}>
      <Card shadow="lg">
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg" color="blue.600">Reservar Turno</Heading>
            
            
            {step === 1 && (
              <VStack w="full" spacing={4}>
                <FormControl>
                  <FormLabel>Elige un día</FormLabel>
                  <Input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleFechaChange}
                  />
                </FormControl>

                <Divider />

                <Text fontWeight="bold">Horarios Disponibles</Text>
                {loading && <Text>Cargando...</Text>}
                
                {!loading && fecha && horarios.length === 0 && (
                    <Text color="red.500">No hay turnos para este día.</Text>
                )}

                <SimpleGrid columns={3} spacing={3} w="full">
                  {horarios.map(hora => (
                    <Button 
                      key={hora} 
                      colorScheme="blue" 
                      variant="outline"
                      onClick={() => handleHoraClick(hora)}
                    >
                      {hora}
                    </Button>
                  ))}
                </SimpleGrid>
              </VStack>
            )}

        
           {step === 2 && (
              <VStack w="full" spacing={3}>
                <Text color="gray.500">
                    Reservando para el <b>{fecha}</b> a las <b>{horaSeleccionada} hs</b>.
                </Text>
                
                <FormControl isRequired isInvalid={!!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                    <FormErrorMessage>{errors.nombre}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                    <FormErrorMessage>{errors.apellido}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.dni}>
                    <FormLabel>DNI</FormLabel>
                    <Input type="number" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                    <FormErrorMessage>{errors.dni}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl>
                    <FormLabel>Teléfono</FormLabel>
                    <Input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors.obraSocialId}>
                    <FormLabel>Obra Social / Cobertura</FormLabel>
                    <Select 
                        placeholder="Seleccione su cobertura..." 
                        onChange={e => setFormData({...formData, obraSocialId: e.target.value})}
                    >
                        {obrasSociales.map(os => (
                            <option key={os.id} value={os.id}>{os.nombre}</option>
                        ))}
                    </Select>
                    <FormErrorMessage>{errors.obraSocialId}</FormErrorMessage>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                        Si no tiene obra social, seleccione la opción "Particular" o "Privado".
                    </Text>
                </FormControl>

                <HStack w="full" pt={4}>
                    <Button variant="ghost" onClick={() => setStep(1)}>Volver</Button>
                    <Button colorScheme="green" w="full" onClick={handleSubmit} isLoading={loading}>
                        Confirmar Reserva
                    </Button>
                </HStack>
              </VStack>
            )}

            
            {step === 3 && (
              <VStack spacing={4} py={6}>
                  <Heading size="2xl">🎉</Heading>
                  <Heading size="md" textAlign="center">¡Turno Confirmado!</Heading>
                  <Text textAlign="center" color="gray.600">
                      Te hemos enviado un correo con los detalles de tu reserva.
                  </Text>
                  <Button colorScheme="blue" onClick={() => window.location.reload()}>
                      Reservar otro
                  </Button>
              </VStack>
            )}

          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ReservaPage;