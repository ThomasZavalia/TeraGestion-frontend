import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importas el Layout y el Protector de Rutas
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// --- PASO 1: IMPORTAR TODAS TUS PÁGINAS ---
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
import TurnosPage from '../pages/turnos/TurnoPage'; // <-- ¡IMPORTA ESTA LÍNEA!
// ... (importa PagosPage, ReportesPage, ConfiguracionPage)

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas (sin el layout) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas (envueltas por el layout y el protector) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          
          {/* --- PASO 2: AÑADE LA RUTA AQUÍ --- */}
          <Route path="/turnos" element={<TurnosPage />} />
          
          {/* ... (aquí irán las rutas de /pagos, /reportes, /configuracion) ... */}
          
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;