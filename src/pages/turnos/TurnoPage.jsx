import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
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

  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isTimePickerOpen, onOpen: onTimePickerOpen, onClose: onTimePickerClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  
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
  

const handleEventClick = (arg) => {
    
      setIsEditingMode(false);
      setTurnoParaEditar(null);

     
      
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

  
  const handleTimeSelect = (time) => {
      
      setIsEditingMode(false);
      setTurnoParaEditar(null);
      const [hour, minute] = time.split(':');
      const fullDate = new Date(selectedDay);
      fullDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      setSelectedFullDate(fullDate);
      onTimePickerClose();
      onCreateOpen(); 
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




const handleTurnoUpdate = (turnoActualizadoDatos) => {
    console.log("handleTurnoUpdate - Datos recibidos:", turnoActualizadoDatos);
    
    if (!calendarRef.current || !turnoActualizadoDatos || !turnoActualizadoDatos.id) {
        console.error("handleTurnoUpdate cancelado: faltan datos o ID.");
        return;
    }

    const calendarApi = calendarRef.current.getApi();
    const eventoIdStr = turnoActualizadoDatos.id.toString();
    const eventoExistente = calendarApi.getEventById(eventoIdStr);

    if (!eventoExistente) {
        console.warn("Evento a actualizar no encontrado en calendario:", eventoIdStr);
        return;
    }

    let eventoFormateado;

   
    if (turnoActualizadoDatos.title && turnoActualizadoDatos.start) {
        console.log("Actualizando con EVENTO COMPLETO.");
       eventoFormateado = {
            ...turnoActualizadoDatos, 
            
         
            title: eventoExistente.title, 
            start: eventoExistente.start, 
            end: eventoExistente.end,    
            
           
            color: getColorForTurno(turnoActualizadoDatos.extendedProps)
        };
    
    } else { 
        console.log("Actualizando con DTO PARCIAL.");
        
        const nuevasProps = {
            ...eventoExistente.extendedProps,
            ...turnoActualizadoDatos
        };

        eventoFormateado = {
            id: eventoIdStr,
            title: eventoExistente.title, 
            start: eventoExistente.start, 
            end: eventoExistente.end,     
            extendedProps: nuevasProps,     
            color: getColorForTurno(nuevasProps) 
        };
    }

    console.log("Evento final formateado:", eventoFormateado);

  
    eventoExistente.remove();
    calendarApi.addEvent(eventoFormateado);
    
   
    setCalendarEvents(prev => [
        ...prev.filter(ev => ev.id !== eventoIdStr),
        eventoFormateado
    ]);

   
    handleCloseCreateModal();
};




  const handleTurnoDelete = (turnoId) => {
     console.log("handleTurnoDelete - ID:", turnoId);
      if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          const eventoExistente = calendarApi.getEventById(turnoId.toString());
          if (eventoExistente) {
              console.log("Eliminando evento del calendario...");
              eventoExistente.remove();
              setCalendarEvents(prev => prev.filter(ev => ev.id !== turnoId.toString()));
          } else {
               console.warn("Evento a eliminar no encontrado en calendario:", turnoId);
          }
      }
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
         slotMinTime="16:00:00"
         slotMaxTime="22:00:00" 
         height="auto"
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
          onDelete={handleTurnoDelete} 
        />
      )}
    </Box>
  );
};

export default TurnosPage;