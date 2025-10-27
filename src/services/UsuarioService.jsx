import axiosInstance from './axiosInstance';

export const usuarioService = {

  getMyProfile: async () => {
    try {
      
      const { data } = await axiosInstance.get('/Usuario/me'); 
      return data; 
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; // Relanza para que el componente maneje el error
    }
  },


  updateMyProfile: async (profileData) => {
   
    try {
      // Llama a PUT /api/Usuario/me
      const { data } = await axiosInstance.put('/Usuario/me', profileData); 
      return data; // Devuelve UsuarioDto actualizado
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error; 
    }
  },

 
  changePassword: async (passwordData) => {
   
    try {
      // Llama a POST /api/Usuario/change-password
      const { data } = await axiosInstance.post('/Usuario/change-password', passwordData); 
      return { success: true, message: data.message || "Contraseña actualizada" };
    } catch (error) {
      console.error("Error changing password:", error);
      // Devuelve el mensaje de error del backend si existe
      return { success: false, message: error.response?.data?.message || "Error al cambiar contraseña" }; 
    }
  },
  
  
};