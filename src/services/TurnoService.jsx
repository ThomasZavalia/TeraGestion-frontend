import  axiosInstance  from './axiosInstance';


const formatTurnoForCalendar = (turno) => {
  let className = 'turno-pendiente'; 
  if (turno.estado) {
   const estadoLower = turno.estado.toLowerCase();
   if (estadoLower === 'pagado') {
     className = 'turno-pagado';
   } else if (estadoLower === 'cancelado') {
    className = 'turno-cancelado';
    }
  }


 const title = (turno.pacienteApellido 
 ? `${turno.pacienteNombre} ${turno.pacienteApellido}` 
 : turno.pacienteNombre
 ).trim();

  return {
   id: turno.id.toString(), 
   title: title, 
   start: turno.fecha || turno.fechaHora, 
   className: className, 
   extendedProps: {
            id: turno.id,
            pacienteId: turno.pacienteId,
            pacienteNombre: turno.pacienteNombre,
            pacienteApellido: turno.pacienteApellido,
            estado: turno.estado,
            precio: turno.precio,
            asistencia: turno.asistencia,
            obraSocialId: turno.obraSocialId ,
            duracion: turno.duracion,
            terapeutaId: turno.terapeutaId
           
        }
  };
};

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


  /**
  
   
   * @param {string|number} id 
   * @returns {Promise<object>}
   */
  getTurnoDetalle: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/Turno/${id}/detalle`);
      return data; 
    } catch (error) {
      console.error("Error al obtener detalle del turno:", error);
      throw error;
    }
  },

  createTurno: async (turnoDto) => {
    
    const { data } = await axiosInstance.post('/Turno', turnoDto);
  
    return formatTurnoForCalendar(data); 
  },
  
  getDisponibilidad: async (fecha, terapeutaId) => {
    try {
  
      const dateString = fecha.toISOString().split('T')[0];
      const { data } = await axiosInstance.get(`/Turno/disponibilidad/${terapeutaId}?fecha=${dateString}`);
      return data; 
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      return [];
    }
  },

 updateTurno: async (id, turnoDto) => {
   
    const { data } = await axiosInstance.put(`/Turno/${id}`, turnoDto);
   
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
  
  marcarComoPagado: async (turnoId, metodoPago = 'Efectivo') => {
    try {
      await axiosInstance.post(`/Turno/${turnoId}/pagar`, { metodoPago });
      return { success: true };
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
      return { success: false, message: error.response?.data?.error || 'Error desconocido' };
    }
  },
getTurnosDeHoy: async () => {
    try {
     
      const { data } = await axiosInstance.get('/Turno/hoy'); 
      
      return data; 
    } catch (error) {
      console.error("Error al obtener turnos de hoy:", error);
      return []; 
    }
  },

  reprogramarTurno: async (id, nuevaFecha) => {
    try {
      const { data } = await axiosInstance.put(`/Turno/${id}/reprogramar`, { nuevaFecha });
      return formatTurnoForCalendar(data); 
    } catch (error) {
      console.error("Error al reprogramar:", error);
      throw error;
    }
  },

 
  
  formatTurnoForCalendar

};