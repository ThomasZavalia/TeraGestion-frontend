import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text
} from '@chakra-ui/react';
import { FiMenu, FiSearch,FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el AuthContext

const Navbar = ({ onToggleSidebar,isDesktop }) => {
  const { user, logout } = useAuth(); // Obtenemos el usuario y la función logout
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Sesión cerrada',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px="4"
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      h="14" // 56px
    >
      
     <IconButton
        aria-label="Toggle Sidebar"
        icon={<FiMenu />}
        variant="ghost"
        onClick={onToggleSidebar} 
      />

     <Box 
        w={{ base: 'full', md: 'md' }} 
        mx="4" 
        display={{ base: 'none', md: 'block' }} 
      >
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Buscar paciente (próximamente...)"
            bg="gray.50"
            borderRadius="md"
            isDisabled // <-- Deshabilitado por ahora
          />
        </InputGroup>
      </Box>

     
      <Menu>
        <MenuButton as={Box} cursor="pointer">
           {/* Muestra Avatar siempre */}
           <Avatar size={'sm'} name={user?.username || '?'} /> 
           {/* Muestra Nombre solo en Desktop */}
           <Text 
               fontSize="sm" 
               display={{ base: 'none', md: 'inline' }} // <-- Oculta nombre en base
               ml={2}
           >
            {user?.username}
          </Text>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => navigate('/configuracion')}>
            Configuración
          </MenuItem>
          <MenuItem onClick={handleLogout}> {/* <-- Llama al logout */}
            Cerrar Sesión
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default Navbar;