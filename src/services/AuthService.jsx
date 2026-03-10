
import axiosInstance from './axiosInstance';

const authService = {

  login: async (username, password) => {
  const response = await axiosInstance.post('/Auth/login', {
    username, 
    password,
  });
  return response.data;
},


  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },


getCurrentUser: () => {
  const userStr = localStorage.getItem('user');


  if (userStr && userStr !== "undefined") {
    try {
   
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error al parsear el usuario de localStorage", e);
      return null;
    }
  }
  return null;
},


  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },


  forgotPassword: async (email) => {
   
    const response = await axiosInstance.post('/Auth/forgot-password', { email });
    return response.data;
  },

 resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post('/Auth/reset-password', { 
      Token: token,              
      NuevaPassword: newPassword, 
      ConfirmarPassword: newPassword 
    });
    return response.data;
  },
};

export default authService;