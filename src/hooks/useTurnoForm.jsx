//import { useState, useEffect, useCallback } from 'react';
import { useState, useEffect, useCallback,useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { turnoService } from '../services/TurnoService';
import { pacienteService } from '../services/PacienteService';
import { obraSocialService } from '../services/ObraSocialService';

// Recibe 'isEditingMode' explícitamente en el objeto config
export const useTurnoForm = (config) => {
  // Desestructuramos las props desde config
  const { selectedDate, turnoAEditar, onTurnoCreado, onTurnoActualizado, isEditingMode } = config; 

  const toast = useToast();

  const isInitialMount = useRef(true);

  // --- Estados del formulario ---
  const [pacienteTipo, setPacienteTipo] = useState('existente');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [apellidoPaciente, setApellidoPaciente] = useState('');
  const [dni, setDni] = useState('');
  const [esParticular, setEsParticular] = useState(false);
  const [obraSocialId, setObraSocialId] = useState(null);
  const [precio, setPrecio] = useState(0);

  // Estados UI
  const [obrasSocialesList, setObrasSocialesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrecio, setIsLoadingPrecio] = useState(false);

  // --- 1. Cargar Obras Sociales ---
  useEffect(() => {
    obraSocialService.getObrasSociales().then(setObrasSocialesList);
  }, []);


  useEffect(() => {
    console.log("[useTurnoForm Init/Reset] Running. isEditingMode:", isEditingMode, "Turno:", turnoAEditar); 
    // Usa isEditingMode para decidir si llenar o resetear
    if (isEditingMode && turnoAEditar) {
      console.log("[useTurnoForm Init/Reset] Initializing for EDIT..."); 
      setPacienteTipo('existente');
      setPacienteSeleccionado({
        value: turnoAEditar.pacienteId,
        label: `${turnoAEditar.pacienteNombre || ''} ${turnoAEditar.pacienteApellido || ''}`,
        obraSocialId: turnoAEditar.obraSocialId
      });
      const particular = turnoAEditar.precio !== null && turnoAEditar.obraSocialId === null;
      setEsParticular(particular);
      setObraSocialId(turnoAEditar.obraSocialId);
      setPrecio(turnoAEditar.precio || 0);
      setNombrePaciente(''); setApellidoPaciente(''); setDni('');
      console.log("[useTurnoForm Init/Reset] State SET for edit."); 
    } else if (!isEditingMode) { // Solo resetea si NO estamos en modo edición
      console.log("[useTurnoForm Init/Reset] Resetting for CREATE..."); 
      setPacienteTipo('existente');
      setPacienteSeleccionado(null);
      setNombrePaciente(''); setApellidoPaciente(''); setDni('');
      setEsParticular(false);
      setObraSocialId(null);
      setPrecio(0);
    }
  }, [isEditingMode, turnoAEditar]);

  
  useEffect(() => {
    // Solo si NO estamos editando
    if (!isEditingMode) { 
      if (pacienteTipo === 'existente' && pacienteSeleccionado) {
        setObraSocialId(pacienteSeleccionado.obraSocialId || null);
      } else if (pacienteTipo === 'nuevo') {
        setObraSocialId(null); 
      }
    }
  }, [pacienteTipo, pacienteSeleccionado, isEditingMode]); 

  // --- 4. Calcular Precio (solo en CREACIÓN) ---
  const fetchPrecio = useCallback(async () => {
    if (!esParticular && obraSocialId) {
      setIsLoadingPrecio(true);
      try {
        const precioCalculado = await obraSocialService.getPrecio(obraSocialId);
        setPrecio(precioCalculado);
      } catch (error) { console.error("Error calculando precio:", error); setPrecio(0); } 
      finally { setIsLoadingPrecio(false); }
    } else {
       if (!isEditingMode) setPrecio(0); // Resetea solo si estamos creando
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esParticular, obraSocialId, isEditingMode]); 


  useEffect(() => {
    if (!isEditingMode) { 
      fetchPrecio();
      return; // Salimos
    }
    if (isInitialMount.current) {
        
        isInitialMount.current = false;
        
    } else {
        
        fetchPrecio();
    }
  }, [fetchPrecio, isEditingMode]);



  const loadPacientes = useCallback((inputValue) => {
      console.log("loadPacientes hook llamado con:", inputValue); // <-- Log
      return pacienteService.buscarPacientes(inputValue);
  }, []);



  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('--- handleSubmit --- Mode:', isEditingMode ? 'EDIT' : 'CREATE'); // <-- Usa isEditingMode

    // DTO Base
    const turnoDtoBase = {
      esParticular: esParticular,
      pacienteId: pacienteSeleccionado?.value, 
      obraSocialId: !esParticular ? obraSocialId : null,
      precio: esParticular ? precio : null, 
    };

    try {
      // Usa isEditingMode para la lógica
      if (isEditingMode) {
        // --- ACTUALIZACIÓN ---
        if (!turnoAEditar?.id) throw new Error("ID del turno a editar no encontrado");
        // DTO específico para actualizar 
        // *** VERIFICA que coincida con tu TurnoDtoActualizacion.cs ***
        const dtoActualizacion = {
            esParticular: turnoDtoBase.esParticular,
            obraSocialId: turnoDtoBase.obraSocialId,
            precio: turnoDtoBase.precio,
            // estado: turnoAEditar.estado // Si lo necesitas
        };
        console.log('Llamando a updateTurno ID:', turnoAEditar.id, 'DTO:', dtoActualizacion); 
        const turnoActualizado = await turnoService.updateTurno(turnoAEditar.id, dtoActualizacion);
        toast({ title: 'Turno Actualizado', status: 'success', duration: 3000 });
        onTurnoActualizado(turnoActualizado); // Callback

      } else {
        // --- CREACIÓN ---
        if (!selectedDate) throw new Error("No se seleccionó fecha para crear turno");
        // DTO de Creación (TurnoDtoCreacion)
        const dtoCreacion = {
            ...turnoDtoBase, 
            fecha: selectedDate.toISOString(), 
            nombrePaciente: pacienteTipo === 'nuevo' ? nombrePaciente : null,
            apellidoPaciente: pacienteTipo === 'nuevo' ? apellidoPaciente : null,
            dni: pacienteTipo === 'nuevo' ? dni : null,
        };
        console.log('Llamando a createTurno DTO:', dtoCreacion); 
        const nuevoTurno = await turnoService.createTurno(dtoCreacion);
        toast({ title: 'Turno Creado', description: `Turno para ${nuevoTurno.title} agendado.`, status: 'success', duration: 3000 });
        onTurnoCreado(nuevoTurno); // Callback
      }
    } catch (error) { 
      console.error('Error en handleSubmit:', error.response?.data || error.message || error); 
      toast({ /* ... (manejo de error) ... */ });
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
    isLoadingPrecio, 
    loadPacientes, 
    handleSubmit,
   
  };
};