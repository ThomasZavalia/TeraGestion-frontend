import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import { turnoService } from '../../services/TurnoService';
import ModalCrearTurno from './components/ModalCrearTurno';
import ModalElegirHora from './components/ModalELegirHora';

const TurnosPage = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);
  
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedFullDate, setSelectedFullDate] = useState(null); 

  const { 
    isOpen: isCreateOpen, 
    onOpen: onCreateOpen, 
    onClose: onCreateClose 
  } = useDisclosure();
  
  const { 
    isOpen: isTimePickerOpen, 
    onOpen: onTimePickerOpen, 
    onClose: onTimePickerClose 
  } = useDisclosure();

  const [selectedTurno, setSelectedTurno] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // --- 1. CORRECCIÓN: Tu useEffect estaba vacío ---
  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      const data = await turnoService.getTurnos(); // Llama al servicio
      setTurnos(data); // Guarda los turnos en el estado
      setLoading(false); // ¡Importante! Pone loading en false
    };
    fetchTurnos();
  }, []); // El array vacío [] asegura que se ejecute 1 sola vez

  // --- Tu función 'handleDateClick' está perfecta ---
  const handleDateClick = (arg) => {
    setSelectedDay(arg.date);
    onTimePickerOpen();
  };
  
  // --- Tu función 'handleTimeSelect' está perfecta ---
  const handleTimeSelect = (time) => { // time es un string "16:00"
    const [hour, minute] = time.split(':');
    const fullDate = new Date(selectedDay);
    fullDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    setSelectedFullDate(fullDate); 
    onTimePickerClose(); 
    onCreateOpen(); 
  };

  // --- Tu función 'handleEventClick' está perfecta ---
  const handleEventClick = (arg) => { 
    setSelectedTurno(arg.event);
    console.log("Turno clickeado:", arg.event.extendedProps);
    // onViewOpen(); 
  };
  
  // --- Tu función 'onTurnoCreado' está perfecta ---
  const onTurnoCreado = (nuevoTurno) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.addEvent(nuevoTurno);
    }
    onCreateClose();
  };

  // --- 2. CORRECCIÓN: Tu 'if (loading)' estaba vacío ---
  // Por eso la pantalla se ponía en blanco.
  // Debe retornar un componente (el Spinner).
  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  // --- 3. CORRECCIÓN: Faltaban los 'eventos' en el <FullCalendar> ---
  return (
    <Box>
    

      <FullCalendar
        // --- 1. Propiedades Esenciales ---
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        events={turnos} // <-- Muestra los turnos cargados
        
        // --- 2. Las Props que te FALTABAN ---
        initialView="timeGridWeek" // <-- Vista inicial por defecto
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay' // <-- ¡LOS BOTONES!
        }}

        // --- 3. Props de Interacción ---
        selectable={true}
        dateClick={handleDateClick}   // <-- Para clics en días/huecos
        eventClick={handleEventClick} // <-- Para clics en turnos
        
        // --- 4. Props de Estilo y Horario ---
        allDaySlot={false}
        slotMinTime="16:00:00"
        slotMaxTime="22:00:00" 
        height="auto"
        
        // --- 5. Props de Idioma ---
        locale={esLocale}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
      />

      {/* --- Tus modales (están perfectos) --- */}
      {selectedFullDate && (
        <ModalCrearTurno
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          selectedDate={selectedFullDate}
          onTurnoCreado={onTurnoCreado}
        />
      )}
      
      {selectedDay && (
        <ModalElegirHora
          isOpen={isTimePickerOpen}
          onClose={onTimePickerClose}
          selectedDay={selectedDay}
          onTimeSelect={handleTimeSelect}
        />
      )}
    </Box>
  );
};

export default TurnosPage;