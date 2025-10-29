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
import ModalElegirHora from './components/ModalElegirHora'; 

const TurnosPage = () => {
  // --- Estados ---
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

  // Carga Inicial
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

  // --- Handlers Interacción Calendario ---
  const handleDateClick = (arg) => {
      // Asegura resetear el modo edición
      setIsEditingMode(false);
      setTurnoParaEditar(null);
      setSelectedDay(arg.date);
      setSelectedFullDate(null); // Limpia fecha completa previa
      onTimePickerOpen();
  };
  

const handleEventClick = (arg) => {
      // Asegura resetear el modo edición
      setIsEditingMode(false);
      setTurnoParaEditar(null);

     
      
      const eventId = arg.event.id;
      const eventoDeMiEstado = calendarEvents.find(ev => ev.id === eventId);

      if (eventoDeMiEstado) {
          console.log("Evento encontrado en React state (fresco):", eventoDeMiEstado);
          setSelectedTurnoEvent(eventoDeMiEstado); // <--- Usamos el evento de nuestro estado
      } else {
          // Fallback por si algo muy raro pasa
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
      onCreateOpen(); // Abre modal creación
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
      handleCloseCreateModal(); // Cierra y limpia
  };
  
  /*const handleTurnoUpdate = (turnoActualizadoDatos) => {
     console.log("handleTurnoUpdate - Datos actualizados:", turnoActualizadoDatos);
      if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          const eventoExistente = calendarApi.getEventById(turnoActualizadoDatos.id.toString());

          if(eventoExistente) {
              console.log("Actualizando evento en calendario ID:", turnoActualizadoDatos.id);
              eventoExistente.remove();
             
             
              const eventoFormateado = turnoService.formatTurnoForCalendar ? turnoService.formatTurnoForCalendar(turnoActualizadoDatos) : turnoActualizadoDatos; 
              calendarApi.addEvent(eventoFormateado);
              
              setCalendarEvents(prev => [...prev.filter(ev => ev.id !== turnoActualizadoDatos.id.toString()), eventoFormateado] ); 
          } else {
              console.warn("Evento a actualizar no encontrado en calendario:", turnoActualizadoDatos.id);
          }
      }
      handleCloseCreateModal();
      
     
  };
  */
const handleTurnoUpdate = (turnoActualizadoDatos) => {
     console.log("handleTurnoUpdate - Datos actualizados:", turnoActualizadoDatos);
     if (calendarRef.current) {
         const calendarApi = calendarRef.current.getApi();
         // Es crucial que el ID sea string para FullCalendar
         const eventoIdStr = turnoActualizadoDatos.id.toString();
         const eventoExistente = calendarApi.getEventById(eventoIdStr);

         if(eventoExistente) {
             console.log("Actualizando evento en calendario ID:", eventoIdStr);

             // 1. Construimos el NUEVO evento
             // Usamos los datos del evento existente que NO cambian
             // y los datos del DTO que SÍ cambiaron.
             const eventoFormateado = {
                 id: eventoIdStr,
                 title: eventoExistente.title, // El paciente (título) no cambió
                 start: eventoExistente.start, // La fecha/hora no cambió
                 end: eventoExistente.end,     // La fecha/hora no cambió
                 
                 // 2. Combinamos las 'extendedProps' (propiedades extendidas)
                 // Mantenemos las antiguas y sobrescribimos con las nuevas del DTO
                 extendedProps: {
                     ...eventoExistente.extendedProps,
                     ...turnoActualizadoDatos 
                     // Esto asume que tu DTO tiene campos como 'obraSocialId', 'precio'
                 },
                 
               
             };

             // 4. Quitamos el viejo y añadimos el nuevo
             eventoExistente.remove();
             calendarApi.addEvent(eventoFormateado);
             
             // 5. Actualizamos el estado de React
             setCalendarEvents(prev => [
                 ...prev.filter(ev => ev.id !== eventoIdStr),
                 eventoFormateado
             ]);

         } else {
             console.warn("Evento a actualizar no encontrado en calendario:", turnoActualizadoDatos.id);
             
         }
     }
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
      handleCloseViewModal(); // Cierra y limpia Ver Turno
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
         // Pasa los eventos formateados al calendario
         events={calendarEvents} 
         eventDisplay='block' 
         eventColor='#3182CE' 
         eventTextColor='white' 
        initialView="timeGridWeek" 
        
        headerToolbar={{
          // Izquierda: Solo flechas en móvil, 'today' en escritorio
          left: 'prev,next today', 
          // Centro: Título siempre
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
          // Key usa isEditingMode Y el ID para forzar re-montaje al cambiar TURNO
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
      
      {/* --- Modal Elegir Hora --- */}
      {isTimePickerOpen && selectedDay && (
        <ModalElegirHora
          isOpen={isTimePickerOpen}
          onClose={onTimePickerClose}
          selectedDay={selectedDay}
          onTimeSelect={handleTimeSelect}
        />
      )}

      {/* --- Modal Ver Turno --- */}
      {isViewOpen && selectedTurnoEvent && (
        <ModalVerTurno
          isOpen={isViewOpen}
          onClose={handleCloseViewModal} 
          turno={selectedTurnoEvent} // Pasamos el EVENTO FC 
          onTurnoUpdate={handleTurnoUpdate} // Para 'Marcar Pagado'
          onEdit={handleEditRequest} // Para iniciar edición
          onDelete={handleTurnoDelete} // Para eliminar
        />
      )}
    </Box>
  );
};

export default TurnosPage;