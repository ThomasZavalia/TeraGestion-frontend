// src/router/index.jsx
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PacientesPage from '../pages/pacientes/PacientesPage';
// ... tus otras páginas
import ProtectedRoute from './ProtectedRoute'; // <-- Importas el protector


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
        
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;