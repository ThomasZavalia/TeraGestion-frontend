
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
};

export default authService;