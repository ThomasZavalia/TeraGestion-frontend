
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
        label: `${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`, 
        obraSocialId: paciente.obraSocialId, 
      }));
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      return [];
    }
  },
  
checkDniExists: async (dni) => {
      try {
        // La URL debe coincidir con tu controller: /api/Pacientes/check-dni
        const { data } = await axiosInstance.get(`/Pacientes/check-dni?dni=${dni}`);
        return data.exists; // Devuelve true o false
      } catch (error) {
        console.error("Error al verificar DNI:", error);
        // Es más seguro devolver 'false' para no bloquear al usuario
        // si la API falla. El backend hará la validación final.
        return false; 
      }
    },


  
};