import  axiosInstance  from './axiosInstance';


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
  
    return formatTurnoForCalendar(data); 
  },
  
  getDisponibilidad: async (fecha) => {
    try {
      // Formatea la fecha a YYYY-MM-DD para el query param
      const dateString = fecha.toISOString().split('T')[0];
      const { data } = await axiosInstance.get(`/Turno/disponibilidad?fecha=${dateString}`);
      return data; // Devuelve el array ej: ["16:00", "19:00"]
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      return [];
    }
  },
  
};