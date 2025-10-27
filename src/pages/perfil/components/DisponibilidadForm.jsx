import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Button,
  useToast,
  SimpleGrid, // Para layout
  Text,
  Box,
  Spinner, // Para estado de carga
  Center,
} from '@chakra-ui/react';
import { disponibilidadService } from '../../../services/DisponibilidadService'; // Ajusta ruta

// Nombres de días para mostrar
const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const DisponibilidadForm = () => {
 
  const [disponibilidad, setDisponibilidad] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // Carga inicial de la disponibilidad
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      setIsLoading(true);
      try {
        const data = await disponibilidadService.getDisponibilidad();
        // Asegura tener 7 días, por si el backend no los devuelve todos
        const fullWeek = diasNombres.map((nombre, index) => {
            const diaData = data.find(d => d.diaSemana === index);
            return {
                diaSemana: index, // 0-6
                diaNombre: nombre, // Nombre para UI
                disponible: diaData?.disponible ?? false, // Default a false si no viene
                horaInicio: diaData?.horaInicio || '', // Usa string vacío para Input
                horaFin: diaData?.horaFin || '', // Usa string vacío para Input
            };
        });
        setDisponibilidad(fullWeek.sort((a,b) => (a.diaSemana === 0 ? 7 : a.diaSemana) - (b.diaSemana === 0 ? 7 : b.diaSemana) )); // Lunes primero
      } catch (error) {
        toast({ title: "Error al cargar disponibilidad", status: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    cargarDisponibilidad();
  }, [toast]);

  // Handler para cambiar cualquier valor de un día
  const handleChange = (diaIndex, field, value) => {
    setDisponibilidad(prev => prev.map((dia, index) => {
        if (index === diaIndex) {
            // Si cambia a 'no disponible', limpia las horas
            if (field === 'disponible' && !value) {
                return { ...dia, disponible: false, horaInicio: '', horaFin: '' };
            }
            return { ...dia, [field]: value };
        }
        return dia;
    }));
  };

  // Handler para guardar
  const handleSave = async () => {
    setIsSaving(true);
    // Prepara el DTO para el backend (solo los campos necesarios)
    const dtoToSend = disponibilidad.map(dia => ({
        diaSemana: dia.diaSemana,
        disponible: dia.disponible,
        // Envía null si el string está vacío
        horaInicio: dia.horaInicio || null, 
        horaFin: dia.horaFin || null,
    }));
    
    // Validaciones básicas (Fin > Inicio si ambos existen)
     for (const dia of dtoToSend) {
         if (dia.disponible && (!dia.horaInicio || !dia.horaFin)) {
              toast({ title: `Horas requeridas para ${diasNombres[dia.diaSemana]}`, description: "Si un día está disponible, debe tener hora de inicio y fin.", status: "warning", duration: 4000 });
              setIsSaving(false);
              return;
         }
         if (dia.horaInicio && dia.horaFin && dia.horaFin <= dia.horaInicio) {
              toast({ title: `Horas inválidas para ${diasNombres[dia.diaSemana]}`, description: "La hora de fin debe ser posterior a la de inicio.", status: "error", duration: 4000 });
              setIsSaving(false);
              return;
         }
     }

    const result = await disponibilidadService.updateDisponibilidad(dtoToSend);
    setIsSaving(false);

    if (result.success) {
      toast({ title: result.message || "Disponibilidad actualizada", status: "success", duration: 3000 });
    } else {
      toast({ title: "Error al guardar", description: result.message, status: "error", duration: 5000 });
    }
  };

  if (isLoading) {
    return <Center h="200px"><Spinner /></Center>;
  }

  return (
    <VStack spacing={6} align="stretch">
      {disponibilidad.map((dia, index) => (
        <Box key={dia.diaSemana} p={4} borderWidth="1px" borderRadius="md">
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="bold">{dia.diaNombre}</Text>
            <Switch 
              isChecked={dia.disponible} 
              onChange={(e) => handleChange(index, 'disponible', e.target.checked)} 
            />
          </HStack>
          {/* Muestra inputs de hora solo si está disponible */}
          {dia.disponible && (
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Hora Inicio</FormLabel>
                <Input 
                  type="time" 
                  size="sm"
                  value={dia.horaInicio}
                  onChange={(e) => handleChange(index, 'horaInicio', e.target.value)} 
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Hora Fin</FormLabel>
                <Input 
                  type="time" 
                  size="sm"
                  value={dia.horaFin}
                  onChange={(e) => handleChange(index, 'horaFin', e.target.value)} 
                />
              </FormControl>
            </SimpleGrid>
          )}
        </Box>
      ))}
      <Button 
        colorScheme="blue" 
        onClick={handleSave} 
        isLoading={isSaving}
        mt={4} // Margen superior
      >
        Guardar Cambios de Disponibilidad
      </Button>
    </VStack>
  );
};

export default DisponibilidadForm;