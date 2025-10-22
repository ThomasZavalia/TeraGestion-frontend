import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { turnoService } from '../services/TurnoService';
import { pacienteService } from '../services/PacienteService';
import { obraSocialService } from '../services/ObraSocialService';

export const useTurnoForm = (selectedDate, onTurnoCreado) => {
  // Estado del formulario
  const [pacienteTipo, setPacienteTipo] = useState('existente');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); // { value, label, obraSocialId }
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [apellidoPaciente, setApellidoPaciente] = useState('');
  const [dni, setDni] = useState('');
  const [esParticular, setEsParticular] = useState(false);
  const [obraSocialId, setObraSocialId] = useState(null);
  const [precio, setPrecio] = useState(0);

  // Estado de la UI
  const [obrasSocialesList, setObrasSocialesList] = useState([]); // [{ value, label }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // 1. Cargar la lista de Obras Sociales al montar
  useEffect(() => {
    const fetchObrasSociales = async () => {
      const data = await obraSocialService.getObrasSociales();
      setObrasSocialesList(data);
    };
    fetchObrasSociales();
  }, []);

  // 2. Autocompletar Obra Social si se selecciona un paciente existente
  useEffect(() => {
    if (pacienteTipo === 'existente' && pacienteSeleccionado) {
      setObraSocialId(pacienteSeleccionado.obraSocialId || null);
    } else {
      setObraSocialId(null); // Resetea si es paciente nuevo
    }
  }, [pacienteTipo, pacienteSeleccionado]);

  // 3. Calcular precio automáticamente si NO es particular
  useEffect(() => {
    if (!esParticular && obraSocialId) {
      const fetchPrecio = async () => {
        const precioCalculado = await obraSocialService.getPrecio(obraSocialId);
        setPrecio(precioCalculado);
      };
      fetchPrecio();
    } else if (esParticular) {
      setPrecio(0); // Resetea el precio si cambia a particular
    } else {
      setPrecio(0); // Resetea si no hay obra social
    }
  }, [esParticular, obraSocialId]);

  // Handler para el buscador de pacientes
  const loadPacientes = (inputValue) => {
    return pacienteService.buscarPacientes(inputValue);
  };

  // Handler para el envío del formulario
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Construir el DTO TurnoDtoCreacion
    const turnoDto = {
      fecha: selectedDate.toISOString(),
      esParticular: esParticular,
      pacienteId: pacienteTipo === 'existente' ? pacienteSeleccionado?.value : null,
      nombrePaciente: pacienteTipo === 'nuevo' ? nombrePaciente : null,
      apellidoPaciente: pacienteTipo === 'nuevo' ? apellidoPaciente : null,
      dni: pacienteTipo === 'nuevo' ? dni : null,
      obraSocialId: !esParticular ? obraSocialId : null,
      precio: esParticular ? precio : null,
    };

    try {
      const nuevoTurno = await turnoService.createTurno(turnoDto);
      toast({
        title: 'Turno Creado',
        description: `Turno para ${nuevoTurno.title} agendado.`,
        status: 'success',
        duration: 3000,
      });
      onTurnoCreado(nuevoTurno); // Llama al callback del padre
    } catch (error) {
      toast({
        title: 'Error al crear el turno',
        description: error.response?.data?.error || 'Error desconocido',
        status: 'error',
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  return {
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
    loadPacientes,
    handleSubmit,
  };
};