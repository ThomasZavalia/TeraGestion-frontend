// ... (Importa axiosInstance) ...
import  axiosInstance  from './axiosInstance';
export const pacienteService = {
  // ... (Aquí van las funciones que está haciendo tu compañero)

  /**
   * Busca pacientes para el combobox asíncrono.
   * @param {string} query - El texto de búsqueda
   * @returns {Promise<Array>} - Una lista de pacientes formateada
   */
  buscarPacientes: async (query) => {
    if (!query) return [];
    try {
      // Llama al endpoint que creaste en PacientesController
      const { data } = await axiosInstance.get(`/Pacientes/buscar?query=${query}`);
      
      // Formateamos los datos para 'chakra-react-select'
      return data.map(paciente => ({
        value: paciente.id, // El ID del paciente
        label: `${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`, // El texto a mostrar
        obraSocialId: paciente.obraSocialId, // ID de la obra social (para autocompletar)
      }));
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      return [];
    }
  }
};