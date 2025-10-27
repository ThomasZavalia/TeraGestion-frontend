import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Radio, RadioGroup, Stack, Input, Switch, Select,
  InputGroup, InputLeftAddon, VStack, Heading, Text
} from '@chakra-ui/react';
import { AsyncSelect } from 'chakra-react-select'; // El buscador
import { format } from 'date-fns'; // Para formatear la fecha
import { es } from 'date-fns/locale'; // Para español
import { useTurnoForm } from '../../../hooks/useTurnoForm';

const ModalCrearTurno = ({ isOpen, onClose, config, isEditingMode }) => {
 // --- LLAMA AL HOOK PASANDO EL OBJETO 'config' ---
const {
    pacienteTipo, setPacienteTipo,
    pacienteSeleccionado, setPacienteSeleccionado,
    nombrePaciente, setNombrePaciente,
    apellidoPaciente, setApellidoPaciente,
    dni, setDni,
    esParticular, setEsParticular,
    obraSocialId, setObraSocialId,
    precio, setPrecio,
    obrasSocialesList,
    isSubmitting,
    isLoadingPrecio, 
    loadPacientes,
    handleSubmit,
    dniError,
    validateDni,

  } = useTurnoForm(config); // <-- Llama con el objeto config
 return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <ModalHeader>
          {/* --- Usa isEditingMode --- */}
          <Heading size="md">{isEditingMode ? 'Editar Turno' : 'Crear Nuevo Turno'}</Heading>
          {/* Muestra fecha solo si estamos creando y existe config.selectedDate */}
          {!isEditingMode && config.selectedDate && ( 
             <Text fontSize="sm" color="gray.500" fontWeight="normal">
               {format(config.selectedDate, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es })}
             </Text>
          )}
        </ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody>
          <VStack spacing={4}>
            {/* --- Usa isEditingMode para deshabilitar --- */}
            <FormControl isDisabled={isEditingMode}> 
              <FormLabel>Paciente</FormLabel>
              <RadioGroup value={pacienteTipo} onChange={setPacienteTipo}>
                <Stack direction="row" spacing={5}>
                  <Radio value="existente">Paciente Existente</Radio>
                  {/* --- Usa isEditingMode para ocultar --- */}
                  {!isEditingMode && <Radio value="nuevo">Paciente Nuevo</Radio>} 
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* --- Usa isEditingMode para deshabilitar --- */}
            {pacienteTipo === 'existente' && (
              <FormControl isRequired isDisabled={isEditingMode}> 
                <FormLabel>Paciente</FormLabel> 
                <AsyncSelect
                  key={isEditingMode ? `edit-${pacienteSeleccionado?.value}` : 'create-select'} // Key actualizada
                  value={pacienteSeleccionado} 
                  placeholder={isEditingMode ? (pacienteSeleccionado?.label || 'Cargando...') : "Escribe un nombre..."} 
                  loadOptions={loadPacientes}
                  onChange={setPacienteSeleccionado}
                  isClearable={!isEditingMode} 
                  cacheOptions={!isEditingMode} 
                  defaultOptions={!isEditingMode} 
                  isDisabled={isEditingMode} // Doble seguridad
                />
              </FormControl>
            )}
            
           {pacienteTipo === 'nuevo' && !isEditingMode && ( 
  <VStack spacing={4} w="full" as="fieldset" border="1px" borderColor="gray.200" p={4} borderRadius="md">

  
    <FormControl isRequired>
      <FormLabel>Nombre</FormLabel>
      <Input 
        value={nombrePaciente} 
        onChange={(e) => setNombrePaciente(e.target.value)} 
        placeholder="Nombre del paciente" 
      />
    </FormControl>

    <FormControl isRequired>
      <FormLabel>Apellido</FormLabel>
      <Input 
        value={apellidoPaciente} 
        onChange={(e) => setApellidoPaciente(e.target.value)} 
        placeholder="Apellido del paciente" 
      />
    </FormControl>

   <FormControl isInvalid={!!dniError}> 
          <FormLabel>DNI</FormLabel>
          <Input 
            value={dni} 
            onChange={(e) => setDni(e.target.value)} 
            placeholder="DNI (sin puntos)"
           
            onBlur={(e) => validateDni(e.target.value)} 
          />
      
          {dniError && <FormErrorMessage>{dniError}</FormErrorMessage>}
        </FormControl>
   

  </VStack>
  )}

             {/* --- Tipo de Turno - Usa isEditingMode --- */}
            <FormControl display="flex" alignItems="center" pt={2}>
              <FormLabel htmlFor="es-particular" mb="0"> ¿Es particular? </FormLabel>
              {/* Deshabilitar si editamos Y es paciente existente */}
             <Switch 
               id="es-particular" 
               isChecked={esParticular} 
               onChange={(e) => setEsParticular(e.target.checked)} />
            </FormControl>
            
      
            {!esParticular && (
              <VStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Obra Social</FormLabel>
                 <Select
                    placeholder="Seleccione una obra social"
                    value={obraSocialId || ''}
                    onChange={(e) => setObraSocialId(e.target.value ? parseInt(e.target.value) : null)}>
                    {obrasSocialesList.map(os => ( <option key={os.value} value={os.value}>{os.label}</option> ))}
                  </Select>
                </FormControl>
                <FormControl>
              
                  <FormLabel>Precio {isEditingMode ? '(Guardado)' : '(Calculado)'}</FormLabel> 
                  <InputGroup>
                    <InputLeftAddon>$</InputLeftAddon>
                   
                    <Input value={precio} isDisabled={isLoadingPrecio || !esParticular} /> 
                  </InputGroup>
                </FormControl>
              </VStack>
            )}
            
            {/* --- Escenario SÍ es particular (Manual) --- */}
            {esParticular && (
              <VStack spacing={4} w="full">
                <FormControl> <FormLabel>Obra Social</FormLabel> <Select placeholder="N/A" isDisabled /> </FormControl>
                <FormControl isRequired>
                  <FormLabel>Precio (Manual)</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>$</InputLeftAddon>
                   
                    <Input type="number" value={precio} onChange={(e) => setPrecio(parseFloat(e.target.value))} /> 
                  </InputGroup>
                </FormControl>
              </VStack>
            )}
            
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}> Cancelar </Button>
          <Button 
            colorScheme="blue" 
            type="submit"
            isLoading={isSubmitting}
            loadingText={isEditingMode ? "Actualizando..." : "Guardando..."}
          >
            {isEditingMode ? 'Actualizar Turno' : 'Guardar Turno'} 
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalCrearTurno;