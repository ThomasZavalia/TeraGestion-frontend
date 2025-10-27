import axiosInstance  from './axiosInstance';

export const obraSocialService = {
  getObrasSociales: async () => {
    try {
      // Asumo que tienes un endpoint /api/ObraSocial
      const { data } = await axiosInstance.get('/ObraSocial');
      // Formateamos para un <Select> de Chakra
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
      // Asumo un endpoint que devuelve el precio
      const { data } = await axiosInstance.get(`/ObraSocial/${obraSocialId}/precio`);
      return data.precio; // Asumimos que devuelve { precio: 1500 }
    } catch (error) {
      console.error("Error al obtener precio:", error);
      return 0;
    }
  }
};