import { useState, useEffect,useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import { turnoService } from '../../services/TurnoService';
import ModalCrearTurno from './components/ModalCrearTurno';
// import ModalVerTurno from './components/ModalVerTurno'; // (Próximo paso)

const TurnosPage = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);
  
  // Estado para los modales
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTurno, setSelectedTurno] = useState(null);

  // Hooks de Chakra para controlar los modales
  const { 
    isOpen: isCreateOpen, 
    onOpen: onCreateOpen, 
    onClose: onCreateClose 
  } = useDisclosure();
  
  const { 
    isOpen: isViewOpen, 
    onOpen: onViewOpen, 
    onClose: onViewClose 
  } = useDisclosure();

  // Cargar los turnos al montar el componente
  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      const data = await turnoService.getTurnos();
      setTurnos(data);
      setLoading(false);
    };
    fetchTurnos();
  }, []);

  // Handler para FullCalendar: Clic en un HUECO VACÍO
  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    onCreateOpen();
  };

  // Handler para FullCalendar: Clic en un EVENTO (turno)
  const handleEventClick = (arg) => {
    setSelectedTurno(arg.event);
    console.log("Turno clickeado:", arg.event.extendedProps);
    // onViewOpen(); // (Descomentar cuando exista ModalVerTurno)
  };
  
  // Callback para agregar el nuevo turno sin recargar
  const onTurnoCreado = (nuevoTurno) => {
  // Usamos el API de FullCalendar para añadir el evento
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.addEvent(nuevoTurno); // <-- Añade el evento al calendario
  }
  onCreateClose(); // Cierra el modal
};

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <FullCalendar
      ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek" // <-- Vista Semanal
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={turnos}
        dateClick={handleDateClick}   // <-- Clic en hueco
        eventClick={handleEventClick} // <-- Clic en evento
        allDaySlot={false} // No mostrar "Todo el día"
        slotMinTime="16:00:00" // Horario de trabajo
        slotMaxTime="22:00:00" 
        height="auto"
        locale={esLocale} // Pone "Octubre", "Lunes", etc.
  buttonText={{
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día'
  }}
      />

      {/* Modal de Creación */}
      {selectedDate && (
        <ModalCrearTurno
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          selectedDate={selectedDate}
          onTurnoCreado={onTurnoCreado}
        />
      )}
      
      {/* Modal de Vista/Edición (Próximo paso) */}
      {/* {selectedTurno && (
        <ModalVerTurno
          isOpen={isViewOpen}
          onClose={onViewClose}
          turno={selectedTurno}
        />
      )} */}
    </Box>
  );
};

export default TurnosPage;