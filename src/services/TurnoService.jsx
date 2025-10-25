import  axiosInstance  from './axiosInstance';


const formatTurnoForCalendar = (turno) => ({
  id: turno.id.toString(), // ID como string
  title: `${turno.pacienteNombre} ${turno.pacienteApellido}`, 
start: turno.fecha, 
className: turno.estado.toLowerCase() === 'pagado' ? 'turno-pagado' : 'turno-pendiente',
  extendedProps: { 
    ...turno
  }
});

export const turnoService = {
  getTurnos: async () => {
    try {
      const { data } = await axiosInstance.get('/Turno'); 
      return data.map(formatTurnoForCalendar); 
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      return [];
    }
  },

  createTurno: async (turnoDto) => {
    
    const { data } = await axiosInstance.post('/Turno', turnoDto);
  
    return formatTurnoForCalendar(data); 
  },
  
  getDisponibilidad: async (fecha) => {
    try {
  
      const dateString = fecha.toISOString().split('T')[0];
      const { data } = await axiosInstance.get(`/Turno/disponibilidad?fecha=${dateString}`);
      return data; 
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      return [];
    }
  },

 updateTurno: async (id, turnoDto) => {
   
    const { data } = await axiosInstance.put(`/Turno/${id}`, turnoDto);
    // Asumimos que el backend devuelve el TurnoCalendarioDto actualizado
    return formatTurnoForCalendar(data); 
  },

  
  deleteTurno: async (id) => {
    try {
      await axiosInstance.delete(`/Turno/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      return { success: false, message: error.response?.data?.error || 'Error desconocido' };
    }
  },
  
  // --- Función Marcar Pagado (ya la teníamos) ---
  marcarComoPagado: async (turnoId, metodoPago = 'Efectivo') => {
    try {
      await axiosInstance.post(`/Turno/${turnoId}/pagar`, { metodoPago });
      return { success: true };
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
      return { success: false, message: error.response?.data?.error || 'Error desconocido' };
    }
  },
};