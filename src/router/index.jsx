import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
import TurnosPage from '../pages/turnos/TurnoPage'; // <-- ¡IMPORTA ESTA LÍNEA!
import PagosPage from '../pages/pagos/PagosPage';
import ReportesPage from '../pages/reportes/ReportesPage';


import { PacienteDetallePage } from '../pages/pacientes/PacienteDetallePage';

const AppRouter = () => {
  return (
    <Routes>
     
      <Route path="/login" element={<LoginPage />} />

     
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/pacientes" element={<PacientesPage />} />

          <Route path="/pacientes/:id" element={<PacienteDetallePage />} />
        
          
       
          <Route path="/turnos" element={<TurnosPage />} />
          
        <Route path="/pagos" element={<PagosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
          
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;