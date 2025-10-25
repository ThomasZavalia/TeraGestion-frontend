// ... (Importa axiosInstance) ...
import  axiosInstance  from './axiosInstance';
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
        label: `${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`, // El texto a mostrar
        obraSocialId: paciente.obraSocialId, 
      }));
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      return [];
    }
  }
};