import axiosInstance from '../axiosInstance';

// (Asumo que tu endpoint en la API es /api/ObrasSociales)
const API_URL = '/ObraSocial'; 

export const obraSocialService = {

  /**
   * Obtiene la lista completa de obras sociales para un <select>
   */
  getAll: async () => {
    try {
      const { data } = await axiosInstance.get(API_URL);
      
      return data; 
    } catch (error) {
      console.error("Error al cargar obras sociales:", error);
      throw error; 
    }
  }
};