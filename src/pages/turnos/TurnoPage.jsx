import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Box, useDisclosure, Spinner, Center,useColorModeValue, useToast, } from '@chakra-ui/react';
import { turnoService } from '../../services/TurnoService';
import ModalCrearTurno from './components/ModalCrearTurno';
import ModalVerTurno from './components/ModalVerTurno'; 
import ModalElegirHora from './components/ModalELegirHora'; 

const TurnosPage = () => {
  
  const [calendarEvents, setCalendarEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedFullDate, setSelectedFullDate] = useState(null); 
  const [selectedTurnoEvent, setSelectedTurnoEvent] = useState(null); 
  const [turnoParaEditar, setTurnoParaEditar] = useState(null);     
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [turnoAReprogramar, setTurnoAReprogramar] = useState(null);

  const toast = useToast();

  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isTimePickerOpen, onOpen: onTimePickerOpen, onClose: onTimePickerClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const modalBg = useColorModeValue('white', 'gray.800');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');

  
  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      try {
        const data = await turnoService.getTurnos();
        setCalendarEvents(data);
        console.log("Turnos iniciales cargados:", data);
      } catch (error) { console.error("Error al cargar turnos iniciales:", error); }
      finally { setLoading(false); }
    };
    fetchTurnos();
  }, []);

  
 const handleDateClick = (arg) => {
    
    setIsEditingMode(false);
    setTurnoParaEditar(null);
    
    setSelectedDay(arg.date);
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
  if (turnoAReprogramar) {
        setTurnoAReprogramar(null);
        toast({ title: "Reprogramación cancelada", status: "info", duration: 2000 });
    }
    
      setIsEditingMode(false);
      setTurnoParaEditar(null);
      setTurnoAReprogramar(null);

     
      
      const eventId = arg.event.id;
      const eventoDeMiEstado = calendarEvents.find(ev => ev.id === eventId);

      if (eventoDeMiEstado) {
          console.log("Evento encontrado en React state (fresco):", eventoDeMiEstado);
          setSelectedTurnoEvent(eventoDeMiEstado); 
      } else {
          
          console.warn("Evento no encontrado en calendarEvents state, usando arg.event (viejo)");
          setSelectedTurnoEvent(arg.event); 
      }
      

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
           
            const turnoActualizado = await turnoService.reprogramarTurno(turnoAReprogramar.id, fullDate);
            
            handleTurnoUpdate(turnoActualizado);
            
            toast({ title: "Turno Reprogramado con éxito", status: "success", duration: 3000 });
            setTurnoAReprogramar(null);
        } catch (error) {
            toast({ title: "Error al reprogramar", description: error.message, status: "error" });
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

 
  const onTurnoCreado = (nuevoTurnoEvento) => {
      console.log("onTurnoCreado - Nuevo evento:", nuevoTurnoEvento);
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.addEvent(nuevoTurnoEvento);
        setCalendarEvents(prev => [...prev, nuevoTurnoEvento]); 
      }
      handleCloseCreateModal(); 
  };

const getColorForTurno = (turnoProps) => {
    if (!turnoProps) return '#3182CE'; 

    if (turnoProps.estado?.toLowerCase() === 'pagado') {
        return '#48BB78'; 
    }
    if (turnoProps.asistencia === 'Ausente') {
        return '#ED8936'; 
    }
    
    
    return '#3182CE'; }




const handleTurnoUpdate = (eventoFormateado) => {
  console.log("handleTurnoUpdate - Recibiendo evento formateado:", eventoFormateado);
  
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    
    
    const eventoIdStr = eventoFormateado.id.toString();
    
  
    const eventoExistente = calendarApi.getEventById(eventoIdStr);

    if (eventoExistente) {
      console.log("Actualizando evento en calendario ID:", eventoIdStr);

     
      eventoExistente.setProp('className', eventoFormateado.className);

     
      eventoExistente.setExtendedProp('estado', eventoFormateado.extendedProps.estado);
      eventoExistente.setExtendedProp('asistencia', eventoFormateado.extendedProps.asistencia);
      
      
      
      setCalendarEvents(prev => 
        prev.map(ev => 
          ev.id === eventoIdStr ? eventoFormateado : ev
        )
      );

    } else {
      
      console.warn("Evento a actualizar no encontrado, agregando como nuevo:", eventoIdStr);
      calendarApi.addEvent(eventoFormateado);
      setCalendarEvents(prev => [...prev, eventoFormateado]);
    }
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


  if (loading) { return ( <Center h="200px"> <Spinner size="xl" /> </Center> ); }

const fechaParaModalCreacion = !isEditingMode ? selectedFullDate : null; 
 
  const turnoParaModalEdicion = isEditingMode ? turnoParaEditar : null;


  console.log("Render TurnosPage - isCreateOpen:", isCreateOpen, "isEditingMode:", isEditingMode, "turnoParaEditar:", turnoParaEditar);

  return(
    <Box>
      <FullCalendar 
         ref={calendarRef}
         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
       
         events={calendarEvents} 
         eventDisplay='block' 
        eventColor='#3182CE' 
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
    </Box>
  );
};

export default TurnosPage;