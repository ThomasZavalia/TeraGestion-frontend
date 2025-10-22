import  axiosInstance  from './axiosInstance';

// Función para formatear el TurnoCalendarioDto para FullCalendar
const formatTurnoForCalendar = (turno) => ({
  id: turno.id.toString(), // ID como string
  title: `${turno.pacienteNombre} ${turno.pacienteApellido}`, 
start: turno.fecha, 

  extendedProps: { 
    ...turno
  }
});

export const turnoService = {
  getTurnos: async () => {
    try {
      const { data } = await axiosInstance.get('/Turno'); 
      return data.map(formatTurnoForCalendar); // Formateamos para el calendario
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      return [];
    }
  },

  createTurno: async (turnoDto) => {
    // El turnoDto es el TurnoDtoCreacion
    const { data } = await axiosInstance.post('/Turno', turnoDto);
    // El backend responde con un TurnoCalendarioDto, lo formateamos
    return formatTurnoForCalendar(data); 
  },
  
  
};