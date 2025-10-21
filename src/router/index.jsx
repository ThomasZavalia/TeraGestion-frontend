// src/router/index.jsx
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
// ... tus otras páginas
import ProtectedRoute from './ProtectedRoute'; // <-- Importas el protector

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas */}
      <Route element={<ProtectedRoute />}> {/* <-- 1. Envoltura de seguridad */}
        <Route element={<DashboardLayout />}> {/* <-- 2. Envoltura de UI */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          {/* ... tus otras rutas privadas ... */}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;