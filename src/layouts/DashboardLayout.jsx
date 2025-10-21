import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  // Estado para controlar si el sidebar está abierto o colapsado
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Define los anchos
  const sidebarWidthOpen = '250px';
  const sidebarWidthCollapsed = '80px'; // Ancho solo para íconos
  const sidebarWidth = isSidebarOpen ? sidebarWidthOpen : sidebarWidthCollapsed;

  // Función para "togglear" el estado
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box>
      {/* 1. El Sidebar */}
      <Sidebar 
        width={sidebarWidth} 
        isOpen={isSidebarOpen} 
      />
      
      {/* 2. El Contenido Principal (Navbar + Outlet) */}
      <Box
        ml={sidebarWidth} // <-- Margen izquierdo dinámico
        transition="margin-left 0.2s ease-in-out" // <-- Animación suave
      >
        {/* El Navbar recibe la función para el botón hamburguesa */}
        <Navbar onToggleSidebar={toggleSidebar} />
        
        {/* El Outlet (tus páginas) con padding */}
        <Box p="4">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;