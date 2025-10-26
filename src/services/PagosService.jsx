import axiosInstance from './axiosInstance';

export const pagoService = {
  /**
   
   * @param {object} filtros 
   * @param {string} filtros.fechaDesde 
   * @param {string} filtros.fechaHasta 
   * @param {number} filtros.pacienteId ll
   * @returns {Promise<Array>} - Lista de objetos PagoDto
   */
  getPagos: async (filtros = {}) => {
    try {
     
      const params = new URLSearchParams();
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
      if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);

      // Realiza la llamada GET a /api/Pagos con los parámetros
      const { data } = await axiosInstance.get('/Pago/pagos-filtrados', { params }); 
      return data; // Devuelve la lista de pagos
    } catch (error) {
      console.error("Error al obtener pagos:", error);
      
      return []; 
    }
  },


};