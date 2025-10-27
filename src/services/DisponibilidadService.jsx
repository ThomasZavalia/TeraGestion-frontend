import axiosInstance from './axiosInstance';


const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const formatDia = (numDia) => diasSemana[numDia] || 'Desconocido';

// Helper para ordenar por día de la semana (Lunes primero)
const ordenarPorDia = (a, b) => {
    // Mapea Domingo (0) a 7 para ordenar Lunes (1) a Domingo (7)
    const diaA = a.diaSemana === 0 ? 7 : a.diaSemana;
    const diaB = b.diaSemana === 0 ? 7 : b.diaSemana;
    return diaA - diaB;
};


export const disponibilidadService = {
 
  getDisponibilidad: async () => {
    try {
      // Llama a GET /api/usuario/me/disponibilidad
      const { data } = await axiosInstance.get('/Usuario/me/disponibilidad'); 
      // Ordena los días de Lunes a Domingo antes de devolver
      return data.sort(ordenarPorDia) || []; 
    } catch (error) {
      console.error("Error fetching disponibilidad:", error);
      throw error;
    }
  },

  // --- Actualizar la disponibilidad semanal ---
  updateDisponibilidad: async (disponibilidadSemanal) => {
    // disponibilidadSemanal debe ser el array de 7 objetos DiaDisponibilidadUpdateDto
    // [{ diaSemana: 1, disponible: true, horaInicio: '16:00', horaFin: '21:00' }, ...]
    try {
       // El DTO del backend espera un objeto { dias: [...] }
      const dto = { dias: disponibilidadSemanal };
      // Llama a PUT /api/usuario/me/disponibilidad
      const { data } = await axiosInstance.put('/Usuario/me/disponibilidad', dto); 
      return { success: true, message: data.message || "Disponibilidad actualizada" };
    } catch (error) {
      console.error("Error updating disponibilidad:", error);
      return { success: false, message: error.response?.data?.error || error.message || "Error al actualizar" };
    }
  },
};