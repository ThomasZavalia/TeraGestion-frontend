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
  // --- Estados (sin cambios en datos) ---
  const [calendarEvents, setCalendarEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedFullDate, setSelectedFullDate] = useState(null); 
  const [selectedTurnoEvent, setSelectedTurnoEvent] = useState(null); 
  const [turnoParaEditar, setTurnoParaEditar] = useState(null);     

const [isEditingMode, setIsEditingMode] = useState(false);

  // Controladores Modales (sin cambios)
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
      setSelectedTurnoEvent(arg.event);
      setSelectedDay(null); // Limpia día seleccionado
      setSelectedFullDate(null);
      onViewOpen();
  };

  // --- Handlers Flujo Modales ---
  const handleTimeSelect = (time) => {
      // Asegura que estamos en modo CREACIÓN
      setIsEditingMode(false);
      setTurnoParaEditar(null);
      const [hour, minute] = time.split(':');
      const fullDate = new Date(selectedDay);
      fullDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      setSelectedFullDate(fullDate);
      onTimePickerClose();
      onCreateOpen(); // Abre modal creación
  };

  // --- MODIFICADO: handleEditRequest ---
  const handleEditRequest = (turnoData) => {
    console.log("[handleEditRequest] Solicitud para editar:", turnoData);
    // 1. Guarda los datos del turno a editar
    setTurnoParaEditar(turnoData);
    // 2. FIJA el modo edición en TRUE
    setIsEditingMode(true);
    // 3. Limpia fecha de creación
    setSelectedFullDate(null);
    // 4. Cierra el modal de Ver
    onViewClose();
    // 5. Abre el modal de Crear/Editar (AHORA con isEditingMode=true)
    console.log("[handleEditRequest] Abriendo modal en modo edición...");
    onCreateOpen();
  };

  // --- Callbacks Resultado CRUD ---
  const onTurnoCreado = (nuevoTurnoEvento) => {
      console.log("onTurnoCreado - Nuevo evento:", nuevoTurnoEvento);
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.addEvent(nuevoTurnoEvento);
        setCalendarEvents(prev => [...prev, nuevoTurnoEvento]); // Actualiza estado local
      }
      handleCloseCreateModal(); // Cierra y limpia
  };
  const handleTurnoUpdate = (turnoActualizadoDatos) => {
     console.log("handleTurnoUpdate - Datos actualizados:", turnoActualizadoDatos);
      if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          const eventoExistente = calendarApi.getEventById(turnoActualizadoDatos.id.toString());

          if(eventoExistente) {
              console.log("Actualizando evento en calendario ID:", turnoActualizadoDatos.id);
              eventoExistente.remove();
              // Re-formateamos los DATOS a EVENTO
              // ¡ASEGÚRATE que turnoService tenga 'formatTurnoForCalendar' exportado si no está en este archivo!
              const eventoFormateado = turnoService.formatTurnoForCalendar ? turnoService.formatTurnoForCalendar(turnoActualizadoDatos) : turnoActualizadoDatos; 
              calendarApi.addEvent(eventoFormateado);
              // Actualiza estado local filtrando y añadiendo el nuevo
              setCalendarEvents(prev => [...prev.filter(ev => ev.id !== turnoActualizadoDatos.id.toString()), eventoFormateado] ); 
          } else {
              console.warn("Evento a actualizar no encontrado en calendario:", turnoActualizadoDatos.id);
          }
      }
      handleCloseCreateModal();
      // No necesitamos cerrar ViewModal aquí si ya se cerró en handleEditRequest
      // handleCloseViewModal(); 
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

  // --- Funciones Cierre y Limpieza ---
  const handleCloseCreateModal = () => {
      console.log("Cerrando Modal Crear/Editar y limpiando.");
      onCreateClose();
      setTurnoParaEditar(null);
      setSelectedFullDate(null);
      // Resetea el modo edición al cerrar
      setIsEditingMode(false);
  };

  const handleCloseViewModal = () => {
      console.log("Cerrando Modal Ver y limpiando.");
      onViewClose();
      setSelectedTurnoEvent(null);
      setTurnoParaEditar(null);
      setIsEditingMode(false);
  };

  // --- Renderizado ---
  if (loading) { return ( <Center h="200px"> <Spinner size="xl" /> </Center> ); }

  // Determina la fecha a pasar (solo relevante para CREAR)
  const fechaParaModalCreacion = selectedFullDate;

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
         slotLabelFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: false, hour12: false, meridiem: false, suffix: ' hs' }}
         locale={esLocale}
         buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
      />

      {/* --- Modal Crear/Editar --- */}
      {/* Renderiza si está abierto */}
      {isCreateOpen && ( 
    <ModalCrearTurno
          // Key usa isEditingMode para forzar re-montaje
          key={isEditingMode ? `edit-${turnoParaEditar?.id || 'new'}` : 'create'} 
          isOpen={isCreateOpen}
          onClose={handleCloseCreateModal} 
         
          config={{
              selectedDate: !isEditingMode ? fechaParaModalCreacion : null, 
              turnoAEditar: isEditingMode ? turnoParaEditar : null, 
              onTurnoCreado: onTurnoCreado,
              onTurnoActualizado: handleTurnoUpdate,
              isEditingMode: isEditingMode // <-- Pasa el modo explícito al hook
          }}
          // --- Pasamos isEditingMode también como prop directa al componente Modal ---
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