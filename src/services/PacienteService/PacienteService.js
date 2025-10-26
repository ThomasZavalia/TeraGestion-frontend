import  axiosInstance  from '../axiosInstance';

const API_URL = '/Paciente';

export const pacienteService = {


   /**
   * Busca pacientes para el combobox asíncrono.
   * @param {string} query - El texto de búsqueda
   * @returns {Promise<Array>} - Una lista de pacientes formateada
   */
  buscarPacientes: async (query) => {
    if (!query) return [];
    try {
      
      const { data } = await axiosInstance.get(`/Paciente/buscar?query=${query}`);
      
      
      return data.map(paciente => ({
        value: paciente.id, // El ID del paciente
        label: `${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`, 
        obraSocialId: paciente.obraSocialId, 
      }));
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      return [];
    }
  },





  getPacientes: async () => {
    try{
      const {data} = await axiosInstance.get(API_URL);
      return data;
    }catch(error){
      console.error("Error al obtener pacientes:", error);
      throw error;
    }
  },


  crearPaciente: async (pacienteData) => {
    try{
      const {data} = await axiosInstance.post(API_URL, pacienteData);
      return data;
    }catch(error){
      console.error("Error al crear el paciente:", error);
      throw error;
    }
  },




  /** 
  *@param {String|number} id
  *@param {Object} pacienteData
  */

  actualizarPaciente: async (id, pacienteData) => {

    try{
      const {data} = await axiosInstance.put(`${API_URL}/${id}`, pacienteData);
      return data;
    }catch (error){
      console.log("Error al actualizar el paciente:", error);
      throw error;
    }
  },



   /**
   * @param {String|number} id
   */

  getPacienteDetalles: async (id) => {
    try{
      const {data} = await axiosInstance.get(`${API_URL}/${id}/detalles`);
      return data;
    }catch (error) {
      console.log("Error al obtener los detalles del paciente:", error);
      throw error;
    }
  }
};