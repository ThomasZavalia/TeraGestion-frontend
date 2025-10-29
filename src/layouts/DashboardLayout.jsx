import { useState, useEffect } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const [isSidebarOpen, setSidebarOpen] = useState(isDesktop);

useEffect(() => {
      setSidebarOpen(isDesktop);
  }, [isDesktop]);
  const sidebarWidthOpen = '250px';
  const sidebarWidthCollapsed = '80px'; 
 const sidebarWidth = isDesktop ? (isSidebarOpen ? sidebarWidthOpen : sidebarWidthCollapsed) : (isSidebarOpen ? sidebarWidthOpen : '0px');
 const marginLeft = isDesktop ? sidebarWidth : (isSidebarOpen ? sidebarWidth : '0px');

 const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box>
      {/* 1. El Sidebar */}
     <Sidebar 
        width={sidebarWidth} 
        isOpen={isSidebarOpen} 
        // Prop para ocultar/mostrar basado en breakpoints
        display={{ base: isSidebarOpen ? 'block' : 'none', md: 'block' }} 
      />
      
   <Box
        // Aplica margen solo en pantallas 'md' o mayores
        ml={{ base: 0, md: marginLeft }} 
        transition="margin-left 0.2s ease-in-out" 
      >
        {/* Navbar recibe 'isDesktop' para saber si mostrar siempre el botón hamburguesa */}
        <Navbar onToggleSidebar={toggleSidebar} isDesktop={isDesktop} />
        
        <Box p={{ base: 2, md: 4 }}> {/* Menos padding en mobile */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;