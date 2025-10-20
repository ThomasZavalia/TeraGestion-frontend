import React from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from './Sidebar'; 
import Navbar from './Navbar';   

const DashboardLayout = () => {
  return (
    <Box>
      <Sidebar /> 
      
    
      <Box ml="250px"> 
        <Navbar />
        
      
        <Box p="4">
          <Outlet /> 
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;