import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Box, useDisclosure, Spinner, Center,useColorModeValue, useToast,Flex,Button,AlertDialog,AlertDialogOverlay,AlertDialogContent,AlertDialogHeader,AlertDialogBody,AlertDialogFooter, } from '@chakra-ui/react';
import { turnoService } from '../../services/TurnoService';
import ModalCrearTurno from './components/ModalCrearTurno';
import ModalVerTurno from './components/ModalVerTurno'; 
import ModalElegirHora from './components/ModalELegirHora'; 
import { FiSlash } from 'react-icons/fi';
import { ausenciaService } from '../../services/AusenciaService';
import ModalRegistrarAusencia from './components/ModalRegistrarAusencia';
import { useSignalR } from '../../context/SignalRContext';



const TurnosPage = () => {
  const [turnos, setTurnos] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedFullDate, setSelectedFullDate] = useState(null); 
  const [selectedTurnoEvent, setSelectedTurnoEvent] = useState(null); 
  const [turnoParaEditar, setTurnoParaEditar] = useState(null);     
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [turnoAReprogramar, setTurnoAReprogramar] = useState(null);
  const [ausencias, setAusencias] = useState([]);
  const [ausenciaAEliminar, setAusenciaAEliminar] = useState(null);
  const { ultimaNotificacion } = useSignalR();
  const [preselectedTime, setPreselectedTime] = useState(null);

  const toast = useToast();

  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isTimePickerOpen, onOpen: onTimePickerOpen, onClose: onTimePickerClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAusenciaOpen, onOpen: onAusenciaOpen, onClose: onAusenciaClose } = useDisclosure();
  const { isOpen: isDeleteAusenciaOpen, onOpen: onDeleteAusenciaOpen, onClose: onDeleteAusenciaClose } = useDisclosure();

  const modalBg = useColorModeValue('white', 'gray.800');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');


  const calcularFechaFin = (inicio, duracionMinutos) => {
    if (!inicio) return null;
    const d = new Date(inicio);
    const minutosASumar = duracionMinutos && duracionMinutos > 0 ? duracionMinutos : 40;
    d.setMinutes(d.getMinutes() + minutosASumar);
    return d.toISOString();
  };
  
const fetchData = async () => {
    setLoading(true);
    try {
        const [turnosData, ausenciasData] = await Promise.all([
            turnoService.getTurnos(),
            ausenciaService.getAusencias()
        ]);

        console.log("---- RECARGANDO DATOS (V3) ----");

        const eventosTurnos = turnosData.map(turno => {
            
            const props = turno.extendedProps || {};

    
            const estado = String(props.estado || '').trim().toLowerCase();
            const asistencia = String(props.asistencia || '').trim().toLowerCase();

            let colorFinal = '#3182CE'; 
            let claseCss = 'turno-pendiente';

            if (estado === 'pagado') {
                colorFinal = '#48BB78'; 
                claseCss = 'turno-pagado';
            } else if (estado === 'cancelado') {
                colorFinal = '#E53E3E'; // Rojo
                claseCss = 'turno-cancelado';
            } else if (asistencia === 'ausente') {
                colorFinal = '#ED8936';
                claseCss = 'turno-ausente';
            }

            
          const duracionReal = props.duracion || turno.duracion; 
            const fechaFinCalculada = calcularFechaFin(turno.start, duracionReal);
           

            return {
                id: turno.id, 
                start: turno.start, 
                end: fechaFinCalculada, 
                title: turno.title,
                backgroundColor: colorFinal, 
                borderColor: colorFinal,     
                textColor: 'white',
                classNames: [claseCss], 
                extendedProps: props
            };
        });
        
        const eventosAusencias = ausenciasData.map(aus => {
             const fechaBase = aus.fecha.split('T')[0];
             return {
                 id: `ausencia-${aus.id}`,
                 start: `${fechaBase}T00:00:00`, end: `${fechaBase}T23:59:59`,
                 allDay: true,
                 display: 'background', backgroundColor: '#FEB2B2',
                 extendedProps: { tipo: 'ausencia', ...aus }
             };
        });

        setCalendarEvents([...eventosTurnos, ...eventosAusencias]);
        setTurnos(eventosTurnos); 
        setAusencias(eventosAusencias);

    } catch (error) { console.error("Error cargando datos:", error); }
    finally { setLoading(false); }
};
 

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (ultimaNotificacion) {
       
        console.log("Turno nuevo detectado, recargando calendario...");
        fetchData(); 
    }
  }, [ultimaNotificacion]);
  
const handleDateClick = (arg) => {
   
    const fechaClickeada = arg.date.toISOString().split('T')[0]; 

 
    const ausenciaEncontrada = ausencias.find(a => a.start.startsWith(fechaClickeada));
    
 
    if (ausenciaEncontrada) {
  
        setAusenciaAEliminar(ausenciaEncontrada.extendedProps); 
        onDeleteAusenciaOpen();
        return; 
    }
   

  
    setIsEditingMode(false); 
    setTurnoParaEditar(null);
    setSelectedDay(arg.date);
    const horaClickeada = arg.date.getHours().toString().padStart(2, '0') + ':' + 
                          arg.date.getMinutes().toString().padStart(2, '0');
    setPreselectedTime(horaClickeada);
    setSelectedFullDate(null); 

    
    onTimePickerOpen();
  };

  const handleReprogramarRequest = (turnoData) => {
      setTurnoAReprogramar(turnoData); 
      handleCloseViewModal(); 
      
     
      toast({
          title: "Modo Reprogramación Activado",
          description: `Selecciona el NUEVO día y horario para ${turnoData.pacienteNombre}.`,
          status: "info",
          duration: 6000, 
          isClosable: true,
          position: 'top',
          containerStyle: {
              border: '2px solid #3182CE', 
          }
      });
  };
  

const handleEventClick = (arg) => { 
   
    if (arg.event.display === 'background' && arg.event.extendedProps.tipo === 'ausencia') {
        setAusenciaAEliminar(arg.event.extendedProps); 
        onDeleteAusenciaOpen();
        return;
    }
  

    setIsEditingMode(false); 
    setTurnoParaEditar(null); 
    setSelectedTurnoEvent(arg.event); 
    setSelectedDay(null); 
    setSelectedFullDate(null);
    onViewOpen(); 
  };


  
  
const handleTimeSelect = async (time) => { 
    const [hour, minute] = time.split(':');
    const fullDate = new Date(selectedDay);
    fullDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
    onTimePickerClose(); 

    if (turnoAReprogramar) {
        try {
            
            let turnoActualizado = await turnoService.reprogramarTurno(turnoAReprogramar.id, fullDate);
            
           
            const duracion = turnoAReprogramar.extendedProps?.duracion || turnoAReprogramar.duracion || 40;
            
          
            turnoActualizado.end = calcularFechaFin(turnoActualizado.start, duracion);
            
        
            handleTurnoUpdate(turnoActualizado);
            
            toast({ title: "Turno Reprogramado", status: "success", duration: 3000 });
            setTurnoAReprogramar(null);
        } catch (error) {
            toast({ title: "Error", description: error.message, status: "error" });
        }
    } else {
        setIsEditingMode(false); 
        setTurnoParaEditar(null); 
        setSelectedFullDate(fullDate); 
        onCreateOpen(); 
    }
};
  
 const handleEditRequest = (datosDelTurno) => { 
  console.log("[handleEditRequest] Solicitud editar con datos:", datosDelTurno);
  
  
  if (!datosDelTurno || !datosDelTurno.id) {
      console.error("[handleEditRequest] ERROR: Se recibieron datos inválidos.", datosDelTurno);
      return; 
  }

 
  setTurnoParaEditar(datosDelTurno); 
  setIsEditingMode(true); 

  setSelectedFullDate(null);
  
  onViewClose(); 
  onCreateOpen(); 
};

const recargarCalendario = () => {
      fetchData();
  };
 
   const onTurnoCreado = (nuevoTurnoEvento) => {
      const eventoVisual = { ...nuevoTurnoEvento };
      
      
      const duracion = eventoVisual.extendedProps?.duracion || eventoVisual.duracion;
      eventoVisual.end = calcularFechaFin(eventoVisual.start, duracion);

      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.addEvent(eventoVisual);
        setCalendarEvents(prev => [...prev, eventoVisual]); 
      }
      handleCloseCreateModal(); 
  };


const handleTurnoUpdate = (eventoFormateado) => {
  console.log("handleTurnoUpdate - Recibiendo evento:", eventoFormateado);
  
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    const eventoIdStr = String(eventoFormateado.id); // Forzamos a String para evitar fallos
    const eventoExistente = calendarApi.getEventById(eventoIdStr);

    // 1. Lógica de colores (la misma que ya tienes, está perfecta)
    const estadoRaw = eventoFormateado.extendedProps?.estado || 'Pendiente';
    const asistenciaRaw = eventoFormateado.extendedProps?.asistencia || '';
    const estado = String(estadoRaw).trim().toLowerCase();
    const asistencia = String(asistenciaRaw).trim().toLowerCase();

    let nuevoColor = '#3182CE'; 
    let nuevaClase = 'turno-pendiente';

    if (estado === 'pagado') {
        nuevoColor = '#48BB78';
        nuevaClase = 'turno-pagado';
    } else if (estado === 'cancelado') {
        nuevoColor = '#E53E3E';
        nuevaClase = 'turno-cancelado';
    } else if (asistencia === 'ausente') {
        nuevoColor = '#ED8936';
        nuevaClase = 'turno-ausente';
    }

    // 2. Si el evento existe en el calendario, lo actualizamos visualmente YA
    if (eventoExistente) {
      const duracion = eventoFormateado.extendedProps?.duracion || 40;
      const fechaFin = calcularFechaFin(eventoFormateado.start, duracion);

      eventoExistente.setStart(eventoFormateado.start);
      eventoExistente.setEnd(fechaFin);
      eventoExistente.setProp('backgroundColor', nuevoColor);
      eventoExistente.setProp('borderColor', nuevoColor);
      eventoExistente.setProp('classNames', [nuevaClase]); // Esto activa tu CSS
      
      // Actualizamos los datos internos por si vuelves a hacer click sin cerrar
      eventoExistente.setExtendedProp('estado', estadoRaw);
      eventoExistente.setExtendedProp('asistencia', asistenciaRaw);
    }

    // 3. ACTUALIZACIÓN DEL ESTADO Y BASE DE DATOS
    // Llamamos a fetchData() para que traiga los datos frescos del servidor
    // y React actualice el estado global de 'calendarEvents'.
    fetchData(); 
  }

  handleCloseCreateModal();
  handleCloseViewModal(); 
};

 const handleCloseCreateModal = () => {
console.log("Cerrando Modal Crear/Editar."); 
 onCreateClose(); 
 
 };

 const handleCloseViewModal = () => {
console.log("Cerrando Modal Ver y limpiando selectedTurnoEvent.");
onViewClose(); 
setSelectedTurnoEvent(null); 
      
};

const handleConfirmarEliminarAusencia = async () => {
      if (!ausenciaAEliminar) return;
      
      setLoading(true); 
      try {
          
          await ausenciaService.eliminarAusencia(ausenciaAEliminar.id);
          
          toast({ title: "Día desbloqueado", description: "Ahora se pueden asignar turnos nuevamente.", status: "success" });
          
          
          const [turnosData, ausenciasData] = await Promise.all([
              turnoService.getTurnos(),
              ausenciaService.getAusencias()
          ]);
         
          fetchData(); 

      } catch (error) {
          toast({ title: "Error al desbloquear", status: "error" });
      } finally {
          setLoading(false);
          onDeleteAusenciaClose();
          setAusenciaAEliminar(null);
      }
  };

  const allowDrop = (dropInfo) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return dropInfo.start >= hoy; 
  };

  const handleEventDrop = (info) => {
      // 1. Obtener datos
      const turnoArrastrado = {
          id: info.event.id,
          title: info.event.title,
          ...info.event.extendedProps 
      };

      const nuevaFecha = info.event.start;
      const hoy = new Date();

     
      if (nuevaFecha < hoy) {
          toast({ 
              title: "Acción no permitida", 
              description: "No puedes mover turnos al pasado.", 
              status: "warning" 
          });
          info.revert(); 
          return;
      }

     
      info.revert(); 

     
      setTurnoAReprogramar(turnoArrastrado);
      

      setSelectedDay(nuevaFecha);
      onTimePickerOpen();
      
      toast({
          title: `Reprogramando a ${turnoArrastrado.pacienteNombre || 'Paciente'}`,
          description: `Selecciona el horario definitivo para el ${nuevaFecha.toLocaleDateString()}`,
          status: "info",
          duration: 4000,
          isClosable: true
      });
  };


  if (loading) { return ( <Center h="200px"> <Spinner size="xl" /> </Center> ); }

const fechaParaModalCreacion = !isEditingMode ? selectedFullDate : null; 
 
  const turnoParaModalEdicion = isEditingMode ? turnoParaEditar : null;


  console.log("Render TurnosPage - isCreateOpen:", isCreateOpen, "isEditingMode:", isEditingMode, "turnoParaEditar:", turnoParaEditar);

  return(
    <Box>
      <Flex justify="flex-end" mb={4}>
          <Button 
            leftIcon={<FiSlash />} 
            colorScheme="red" 
            variant="outline" 
            size="sm"
            onClick={onAusenciaOpen}
          >
            Registrar Ausencia (Bloquear Día)
          </Button>
      </Flex>
      <FullCalendar 
         ref={calendarRef}
         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
       
         events={calendarEvents} 
         eventDisplay='block' 
       // eventColor='#3182CE' 
       editable={true} 
    eventDrop={handleEventDrop} 
    eventAllow={allowDrop}
         eventTextColor='white' 
        initialView="timeGridWeek" 
        
        headerToolbar={{
          
          left: 'prev,next today', 
          
          center: 'title',
         
          right: 'dayGridMonth,timeGridWeek,timeGridDay' 
         
        }}
        
         selectable={true}
         dateClick={handleDateClick}   
         eventClick={handleEventClick} 
         allDaySlot={false}
        slotMinTime="08:00:00" 
        slotMaxTime="23:00:00"
        scrollTime="16:00:00"

        slotDuration="00:15:00"   
    slotLabelInterval="01:00"

         height="75vh"
         dayMaxEvents={true}
       slotLabelFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: false, hour12: false, meridiem: false, suffix: ' hs' }}
         locale={esLocale}
         buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}

         
      />

    
      {isCreateOpen && ( 
   <ModalCrearTurno
          
          key={isEditingMode ? `edit-${turnoParaModalEdicion?.id || 'new'}` : 'create'} 
          isOpen={isCreateOpen}
          onClose={handleCloseCreateModal} 
      
          config={{
            
              selectedDate: fechaParaModalCreacion, 
         
              turnoAEditar: turnoParaModalEdicion, 
              onTurnoCreado: onTurnoCreado,
              onTurnoActualizado: handleTurnoUpdate,
         
              isEditingMode: isEditingMode 
          }}
         
          isEditingMode={isEditingMode} 
        />
      )}
      
    
      {isTimePickerOpen && selectedDay && (
        <ModalElegirHora
          isOpen={isTimePickerOpen}
          onClose={onTimePickerClose}
          selectedDay={selectedDay}
          onTimeSelect={handleTimeSelect}
          preselectedTime={preselectedTime}
        />
      )}

     
   {isViewOpen && selectedTurnoEvent && (
        <ModalVerTurno
          isOpen={isViewOpen}
          onClose={handleCloseViewModal} 
          turno={selectedTurnoEvent} 
          onTurnoUpdate={handleTurnoUpdate} 
          onEdit={handleEditRequest}
          onReprogramar={handleReprogramarRequest}
        />

        
      )}

      <ModalRegistrarAusencia 
        isOpen={isAusenciaOpen}
        onClose={onAusenciaClose}
        onAusenciaCreada={recargarCalendario} 
      />

      <AlertDialog
        isOpen={isDeleteAusenciaOpen}
        leastDestructiveRef={calendarRef} 
        onClose={onDeleteAusenciaClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Desbloquear Día
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Quieres eliminar la ausencia del día <strong>{ausenciaAEliminar?.fecha?.split('T')[0]}</strong>?
              <br /><br />
              El día volverá a estar disponible para nuevos turnos, pero <strong>los turnos que ya fueron cancelados permanecerán cancelados</strong>.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={calendarRef} onClick={onDeleteAusenciaClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleConfirmarEliminarAusencia} ml={3}>
                Desbloquear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TurnosPage;