import { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, VStack, Heading, Text, Spinner, Center, Wrap
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { turnoService } from '../../../services/TurnoService';

const ModalElegirHora = ({ isOpen, onClose, selectedDay, onTimeSelect }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedDay) {
      setIsLoading(true);
      const fetchSlots = async () => {
        const slots = await turnoService.getDisponibilidad(selectedDay);
        setAvailableSlots(slots);
        setIsLoading(false);
      };
      fetchSlots();
    }
  }, [selectedDay]);

  const handleTimeClick = (time) => {
    onTimeSelect(time); 
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Horarios Disponibles</Heading>
          <Text fontSize="sm" color="gray.500" fontWeight="normal">
            {selectedDay ? format(selectedDay, "eeee dd 'de' MMMM, yyyy", { locale: es }) : ''}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center h="100px">
              <Spinner />
            </Center>
          ) : (
            <Wrap spacing="3">
              {availableSlots.length > 0 ? (
                availableSlots.map((time) => (
                  <Button
                    key={time}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => handleTimeClick(time)}
                  >
                    {time} hs
                  </Button>
                ))
              ) : (
                <Text>No hay horarios disponibles para este día.</Text>
              )}
            </Wrap>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalElegirHora;