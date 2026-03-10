import axiosInstance from './axiosInstance';

export const usuarioService = {

  getMyProfile: async () => {
    try {
      
      const { data } = await axiosInstance.get('/Usuario/me'); 
      return data; 
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; 
    }
  },


  updateMyProfile: async (profileData) => {
   
    try {
    
      const { data } = await axiosInstance.put('/Usuario/me', profileData); 
      return data; 
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error; 
    }
  },

 
  changePassword: async (passwordData) => {
   
    try {

      const { data } = await axiosInstance.post('/Usuario/change-password', passwordData); 
      return { success: true, message: data.message || "Contraseña actualizada" };
    } catch (error) {
      console.error("Error changing password:", error);
      
      return { success: false, message: error.response?.data?.message || "Error al cambiar contraseña" }; 
    }
  },
  getTerapeutas: async () => {
    try {
      const { data } = await axiosInstance.get('/Usuario/terapeutas');
      return data;
    } catch (error) {
      console.error("Error al traer terapeutas:", error);
      return [];
    }
  }
  
  
};