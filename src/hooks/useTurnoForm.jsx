
import { useState, useEffect, useCallback,useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { turnoService } from '../services/TurnoService';
import { pacienteService } from '../services/PacienteService';
import { obraSocialService } from '../services/ObraSocialService';


export const useTurnoForm = (config) => {
  
  const { selectedDate, turnoAEditar, onTurnoCreado, onTurnoActualizado, isEditingMode } = config; 

  const toast = useToast();

  const isInitialMount = useRef(true);

  
  const [pacienteTipo, setPacienteTipo] = useState('existente');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [apellidoPaciente, setApellidoPaciente] = useState('');
  const [dni, setDni] = useState('');
  const [esParticular, setEsParticular] = useState(false);
  const [obraSocialId, setObraSocialId] = useState(null);
  const [precio, setPrecio] = useState(0);
  const [dniError, setDniError] = useState(null);

  
  const [obrasSocialesList, setObrasSocialesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrecio, setIsLoadingPrecio] = useState(false);

  
  useEffect(() => {
    obraSocialService.getObrasSociales().then(setObrasSocialesList);
  }, []);


  useEffect(() => {
    console.log("[useTurnoForm Init/Reset] Running. isEditingMode:", isEditingMode, "Turno:", turnoAEditar); 
    
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
    } else if (!isEditingMode) { 
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
   
    if (!isEditingMode) { 
      if (pacienteTipo === 'existente' && pacienteSeleccionado) {
        setObraSocialId(pacienteSeleccionado.obraSocialId || null);
      } else if (pacienteTipo === 'nuevo') {
        setObraSocialId(null); 
      }
    }
  }, [pacienteTipo, pacienteSeleccionado, isEditingMode]); 

  
  const fetchPrecio = useCallback(async () => {
    if (!esParticular && obraSocialId) {
      setIsLoadingPrecio(true);
      try {
        const precioCalculado = await obraSocialService.getPrecio(obraSocialId);
        setPrecio(precioCalculado);
      } catch (error) { console.error("Error calculando precio:", error); setPrecio(0); } 
      finally { setIsLoadingPrecio(false); }
    } else {
       if (!isEditingMode) setPrecio(0); 
    }
 
  }, [esParticular, obraSocialId, isEditingMode]); 


  useEffect(() => {
    
    if (!isEditingMode) { 
   fetchPrecio();
      return; 
 }
    if (isInitialMount.current) {
        
        isInitialMount.current = false;
        
    } else {
        
       fetchPrecio();
 }
  }, [fetchPrecio, isEditingMode]);



  const loadPacientes = useCallback((inputValue) => {
      console.log("loadPacientes hook llamado con:", inputValue); 
      return pacienteService.buscarPacientes(inputValue);
  }, []);

  const validateDni = useCallback(async (dniValue) => {
   
    if (!dniValue || pacienteTipo !== 'nuevo' || isEditingMode) { 
        setDniError(null); 
        return; 
    }

    try {
       
        const exists = await pacienteService.checkDniExists(dniValue); 
        if (exists) {
            setDniError('Este DNI ya está registrado. Use "Paciente Existente".');
        } else {
            setDniError(null);
        }
    } catch (error) {
        console.error("Error validando DNI:", error);
        setDniError('No se pudo validar el DNI.'); 
    }
  }, [pacienteTipo, isEditingMode])



  const handleSubmit = async () => {
if (dniError) {
        toast({ 
            title: 'Error en formulario', 
            description: dniError, 
            status: 'error', 
            duration: 4000 
        });
        return; 
    }

    setIsSubmitting(true);
    console.log('--- handleSubmit --- Mode:', isEditingMode ? 'EDIT' : 'CREATE'); 

    // DTO Base
    const turnoDtoBase = {
      esParticular: esParticular,
      pacienteId: pacienteSeleccionado?.value, 
      obraSocialId: !esParticular ? obraSocialId : null,
      precio: esParticular ? precio : null, 
    };

    try {
      
     if (isEditingMode) {

if (!turnoAEditar?.id) throw new Error("ID del turno a editar no encontrado");


 const dtoActualizacion = {
esParticular: turnoDtoBase.esParticular,
obraSocialId: turnoDtoBase.obraSocialId,
precio: precio, 
 };

 console.log('Llamando a updateTurno ID:', turnoAEditar.id, 'DTO:', dtoActualizacion); 

        
 const turnoActualizadoResponse = await turnoService.updateTurno(turnoAEditar.id, dtoActualizacion);

        toast({ title: 'Turno Actualizado', status: 'success', duration: 3000 });

       
        const datosCompletosParaUI = {
            ...turnoActualizadoResponse, 
            ...dtoActualizacion,         
            id: turnoAEditar.id          
        };

       
onTurnoActualizado(datosCompletosParaUI); 
} else {
       
        if (!selectedDate) throw new Error("No se seleccionó fecha para crear turno");
        
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
      
     
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error ||   
                         error.response?.data ||          
                         'Ocurrió un error desconocido.'; 

toast({ 
          title: 'Error al guardar',
          description: errorMessage, 
          status: 'error',         
          duration: 5000,
          isClosable: true,
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
    isLoadingPrecio, 
    loadPacientes, 
    handleSubmit,
    dniError,
    validateDni,
   
  };
};