import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Radio, RadioGroup, Stack, Input, Switch, Select,
  InputGroup, InputLeftAddon, VStack, Heading, Text
} from '@chakra-ui/react';
import { AsyncSelect } from 'chakra-react-select'; // El buscador
import { format } from 'date-fns'; // Para formatear la fecha
import { es } from 'date-fns/locale'; // Para español
import { useTurnoForm } from '../../../hooks/useTurnoForm';

const ModalCrearTurno = ({ isOpen, onClose, selectedDate, onTurnoCreado }) => {
  const {
    pacienteTipo, setPacienteTipo,
    setPacienteSeleccionado,
    nombrePaciente, setNombrePaciente,
    apellidoPaciente, setApellidoPaciente,
    dni, setDni,
    esParticular, setEsParticular,
    obraSocialId, setObraSocialId,
    precio, setPrecio,
    obrasSocialesList,
    isSubmitting,
    loadPacientes,
    handleSubmit,
  } = useTurnoForm(selectedDate, onTurnoCreado);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <ModalHeader>
          <Heading size="md">Crear Nuevo Turno</Heading>
          <Text fontSize="sm" color="gray.500" fontWeight="normal">
            {format(selectedDate, "eeee dd 'de' MMMM, yyyy 'a las' HH:mm 'hs'", { locale: es })}
          </Text>
        </ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody>
          <VStack spacing={4}>
            
            {/* Paso 1: Paciente Nuevo o Existente */}
            <FormControl>
              <FormLabel>Paciente</FormLabel>
              <RadioGroup value={pacienteTipo} onChange={setPacienteTipo}>
                <Stack direction="row" spacing={5}>
                  <Radio value="existente">Paciente Existente</Radio>
                  <Radio value="nuevo">Paciente Nuevo</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Escenario A: Paciente Existente */}
            {pacienteTipo === 'existente' && (
              <FormControl isRequired>
                <FormLabel>Buscar paciente</FormLabel>
                <AsyncSelect
                  placeholder="Escribe un nombre, apellido o DNI..."
                  loadOptions={loadPacientes}
                  onChange={setPacienteSeleccionado}
                  isClearable
                  cacheOptions
                  defaultOptions
                />
              </FormControl>
            )}
            
            {/* Escenario B: Paciente Nuevo */}
            {pacienteTipo === 'nuevo' && (
              <VStack spacing={4} w="full" as="fieldset" border="1px" borderColor="gray.200" p={4} borderRadius="md">
                <legend><Text fontSize="sm" fontWeight="medium">Datos del Nuevo Paciente</Text></legend>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input value={nombrePaciente} onChange={(e) => setNombrePaciente(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Apellido</FormLabel>
                  <Input value={apellidoPaciente} onChange={(e) => setApellidoPaciente(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>DNI</FormLabel>
                  <Input type="number" value={dni} onChange={(e) => setDni(e.target.value)} />
                </FormControl>
              </VStack>
            )}

            {/* Paso 2: Tipo de Turno (Particular / Obra Social) */}
            <FormControl display="flex" alignItems="center" pt={2}>
              <FormLabel htmlFor="es-particular" mb="0">
                ¿Es particular?
              </FormLabel>
              <Switch id="es-particular" isChecked={esParticular} onChange={(e) => setEsParticular(e.target.checked)} />
            </FormControl>
            
            {/* Escenario A: NO es particular (Obra Social) */}
            {!esParticular && (
              <VStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Obra Social</FormLabel>
                  <Select
                    placeholder="Seleccione una obra social"
                    value={obraSocialId || ''}
                    onChange={(e) => setObraSocialId(e.target.value ? parseInt(e.target.value) : null)}
                    isDisabled={pacienteTipo === 'existente' && !!obraSocialId} // Deshabilitado si es existente y ya tiene OS
                  >
                    {obrasSocialesList.map(os => (
                      <option key={os.value} value={os.value}>{os.label}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Precio (calculado)</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>$</InputLeftAddon>
                    <Input value={precio} isDisabled />
                  </InputGroup>
                </FormControl>
              </VStack>
            )}
            
            {/* Escenario B: SÍ es particular (Manual) */}
            {esParticular && (
              <VStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Obra Social</FormLabel>
                  <Select placeholder="N/A" isDisabled />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Precio (manual)</FormLabel>
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
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            colorScheme="blue" 
            type="submit"
            isLoading={isSubmitting}
            loadingText="Guardando..."
          >
            Guardar Turno
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalCrearTurno;