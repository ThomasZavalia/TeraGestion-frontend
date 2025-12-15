import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
import TurnosPage from '../pages/turnos/TurnoPage'; 
import PagosPage from '../pages/pagos/PagosPage';
import ReportesPage from '../pages/reportes/ReportesPage';
import PerfilPage from '../pages/perfil/PerfilPage'; 
import ReservaPage from '../pages/public/ReservaPage';
import ConfirmarTurnoPage from '../pages/public/ConfirmarTurnoPage';
import { SignalRProvider } from '../context/SignalRContext';


import { PacienteDetallePage } from '../pages/pacientes/PacienteDetallePage';

const SignalRWrapper = () => {
  return (
    <SignalRProvider>
      <DashboardLayout /> 
    </SignalRProvider>
  );
};
const AppRouter = () => {
  return (
    <Routes>
     
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reservar" element={<ReservaPage />} />
      <Route path="/confirmar-turno" element={<ConfirmarTurnoPage />} />

      <Route path="/forgot-password" element={<div>Olvidé contraseña (Pendiente)</div>} />
      <Route path="/reset-password" element={<div>Resetear (Pendiente)</div>} />

     
      <Route element={<ProtectedRoute />}>
        <Route element={<SignalRWrapper />}>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/pacientes" element={<PacientesPage />} />

          <Route path="/pacientes/:id" element={<PacienteDetallePage />} />
        
          
       
          <Route path="/turnos" element={<TurnosPage />} />
          
        <Route path="/pagos" element={<PagosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/configuracion" element={<PerfilPage />} />
          
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;