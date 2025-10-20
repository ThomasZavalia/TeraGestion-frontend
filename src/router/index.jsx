import React from 'react';
import { Routes, Route } from 'react-router-dom';


import DashboardLayout from '../layouts/DashboardLayout';


import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
import TurnosPage from '../pages/turnos/TurnoPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas (sin el layout) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas (envueltas por el layout) */}
      <Route element={<DashboardLayout />}> {/* <-- 1. Ruta "padre" */}
        <Route path="/" element={<HomePage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/turnos" element={<TurnosPage />} />
        {/* ...las demás rutas van aquí adentro */}
      </Route>
    </Routes>
  );
};

export default AppRouter;