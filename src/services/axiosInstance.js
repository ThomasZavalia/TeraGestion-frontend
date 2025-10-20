import axios from 'axios';


const API_BASE_URL = 'https://localhost:7066/api';

// 2. CREA LA INSTANCIA
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});


axiosInstance.interceptors.request.use(
  (config) => {
    // Busca el token guardado (lo guardarás en el login)
    const token = localStorage.getItem('authToken'); 
    
    if (token) {
     
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
  
    return Promise.reject(error);
  }
);