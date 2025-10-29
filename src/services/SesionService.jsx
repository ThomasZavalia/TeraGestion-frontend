import axiosInstance from './axiosInstance';

export const sesionService = {
  /**
   * Crea un registro básico de sesión (asistencia/ausencia).
   * @param {number} turnoId 
   * @param {string} asistencia 
   * @returns {Promise<object>} 
   */
  createSesion: async (turnoId, asistencia) => {
    try {
     
      const { data } = await axiosInstance.post('/Sesion', { turnoId, asistencia }); 
     
      return { success: true, data }; 
    } catch (error) {
      console.error("Error al crear sesión:", error);
      const errorMessage = error.response?.data?.error 
                        || error.response?.data?.title 
                        || error.response?.data?.message 
                        || "No se pudo registrar la asistencia.";
      
      if (errorMessage.includes("Ya existe una sesión")) {
          return { success: false, message: errorMessage, alreadyExists: true };
      }
      return { success: false, message: errorMessage };
    }
  },

};