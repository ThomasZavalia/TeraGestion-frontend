import { Box, VStack, Heading, Text, Link } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiBarChart2,
} from 'react-icons/fi';

// Componente interno para cada item de navegación
const NavItem = ({ icon, children, to, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      as={RouterLink}
      to={to}
      _hover={{ textDecoration: 'none' }}
      w="full"
    >
      <Box
        display="flex"
        alignItems="center"
        p="3"
        mx="2"
        borderRadius="lg"
        bg={isActive ? 'blue.500' : 'transparent'}
        color={isActive ? 'white' : 'gray.300'}
        _hover={{
          bg: 'gray.700',
          color: 'white',
        }}
        transition="background 0.2s ease"
      >
        {/* El ícono */}
        <Box as={icon} fontSize="20" />
        
        {/* El texto (solo si está abierto) */}
        {isOpen && (
          <Text ml="4" fontSize="sm" fontWeight="medium">
            {children}
          </Text>
        )}
      </Box>
    </Link>
  );
};

// Componente principal del Sidebar
const Sidebar = ({ width, isOpen, display }) => {
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      w={width} // <-- Ancho dinámico
      bg="gray.800"
      color="white"
      display={display} 
      transition="width 0.2s ease-in-out" 
      zIndex="sticky"
      overflowY="auto" // Permite scroll si hay muchos items
    >
      <VStack align="stretch" h="full">
        {/* Logo */}
        <Heading
          size="md"
          textAlign="center"
          py="5"
          borderBottomWidth="1px"
          borderColor="gray.700"
        >
          {isOpen ? 'TeraGestión' : 'TG'}
        </Heading>

        {/* Links Principales */}
        <VStack spacing="2" align="stretch" mt="4" as="nav" flex="1">
          <NavItem to="/" icon={FiHome} isOpen={isOpen}>
            Dashboard
          </NavItem>
          <NavItem to="/turnos" icon={FiCalendar} isOpen={isOpen}>
            Turnos
          </NavItem>
          <NavItem to="/pacientes" icon={FiUsers} isOpen={isOpen}>
            Pacientes
          </NavItem>
          <NavItem to="/pagos" icon={FiDollarSign} isOpen={isOpen}>
            Pagos
          </NavItem>
          <NavItem to="/reportes" icon={FiBarChart2} isOpen={isOpen}>
            Reportes
          </NavItem>
        </VStack>

        {/* Link de Configuración (al final) */}
        <VStack spacing="2" align="stretch" mb="4" as="nav">
          <NavItem to="/configuracion" icon={FiSettings} isOpen={isOpen}>
            Configuración
          </NavItem>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;