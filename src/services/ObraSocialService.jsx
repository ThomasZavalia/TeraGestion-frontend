import axiosInstance  from './axiosInstance';

export const obraSocialService = {
  getObrasSociales: async () => {
    try {
      
      const { data } = await axiosInstance.get('/ObraSocial');
     
      return data.map(os => ({
        value: os.id,
        label: os.nombre,
      }));
    } catch (error) {
      console.error("Error al obtener obras sociales:", error);
      return [];
    }
  },

  getPrecio: async (obraSocialId) => {
    try {
     
      const { data } = await axiosInstance.get(`/ObraSocial/${obraSocialId}/precio`);
      return data.precio; 
    } catch (error) {
      console.error("Error al obtener precio:", error);
      return 0;
    }
  }
};