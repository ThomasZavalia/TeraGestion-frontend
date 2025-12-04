import axios from 'axios';


const publicAxios = axios.create({
  baseURL: 'https://localhost:7066/api/public', 
});

export const publicService = {
  getDisponibilidad: async (fecha) => {
    const dateString = fecha.toISOString().split('T')[0];
    const { data } = await publicAxios.get(`/turnos/disponibilidad?fecha=${dateString}`);
    return data;
  },
  getObrasSociales: async () => {
    const { data } = await publicAxios.get('/turnos/obras-sociales');
    return data;
  },
  reservar: async (reservaData) => {
    const { data } = await publicAxios.post('/turnos/reservar', reservaData);
    return data;
  }
};