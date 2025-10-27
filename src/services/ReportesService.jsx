import axiosInstance from './axiosInstance';

/**
 * Formatea fechas para query params (YYYY-MM-DD)
 * @param {Date | string | null} date 
 * @returns {string | null}
 */
const formatDateQuery = (date) => {
    if (!date) return null;
    try {
        // Si ya es string YYYY-MM-DD, lo devuelve
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        // Si es objeto Date, lo formatea
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        return null; // Devuelve null si la fecha es inválida
    }
};

export const reportesService = {
    getTopPacientes: async () => {
        try {
            const { data } = await axiosInstance.get('/Reportes/top-pacientes');
            return data || [];
        } catch (error) {
            console.error("Error fetching top pacientes:", error);
            return [];
        }
    },

    getMetodosPago: async () => {
        try {
            const { data } = await axiosInstance.get('/Reportes/metodos-pago');
            return data || [];
        } catch (error) {
            console.error("Error fetching metodos pago:", error);
            return [];
        }
    },

    getTurnosPorEstado: async () => {
        try {
            const { data } = await axiosInstance.get('/Reportes/turnos-por-estado');
            return data || [];
        } catch (error) {
            console.error("Error fetching turnos por estado:", error);
            return [];
        }
    },

    getTurnosPorMes: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);

            const { data } = await axiosInstance.get('/Reportes/turnos-por-mes', { params });
            return data || [];
        } catch (error) {
            console.error("Error fetching turnos por mes:", error);
            return [];
        }
    },

    getIngresosPorMes: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            const fechaDesde = formatDateQuery(filtros.fechaDesde);
            const fechaHasta = formatDateQuery(filtros.fechaHasta);
            if (fechaDesde) params.append('fechaDesde', fechaDesde);
            if (fechaHasta) params.append('fechaHasta', fechaHasta);

            const { data } = await axiosInstance.get('/Reportes/ingresos-por-mes', { params });
            // Asegúrate que el backend devuelva decimal, si no, usa parseInt aquí
            return data || []; 
        } catch (error) {
            console.error("Error fetching ingresos por mes:", error);
            return [];
        }
    },
};