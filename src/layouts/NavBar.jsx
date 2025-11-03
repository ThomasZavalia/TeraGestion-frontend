import {
  Box,
  Flex,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  useBreakpointValue, 
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { AsyncSelect } from 'chakra-react-select';
import { pacienteService } from '../services/PacienteService';

const Navbar = ({ onToggleSidebar, isDesktop }) => { 
  const { user, logout } = useAuth();
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

  const loadPacienteOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 3) return []; 
    
   
    return pacienteService.buscarPacientes(inputValue); 
  };

  const handlePacienteChange = (selectedOption) => {
    if (selectedOption) {
      console.log("Navegando a paciente:", selectedOption.value);
    
      navigate(`/pacientes/${selectedOption.value}`);
      
    
    }
  };

const selectStyles = {
    control: (provided) => ({
      ...provided,
      bg: 'gray.50',
      borderRadius: 'md',
      borderColor: 'gray.200',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: 'sm',
    }),
    input: (provided) => ({
      ...provided,
      fontSize: 'sm',
    }),
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
      h="14" 
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
        <AsyncSelect
          placeholder="Buscar paciente por nombre, apellido o DNI..."
          loadOptions={loadPacienteOptions} 
          onChange={handlePacienteChange}
          chakraStyles={selectStyles} 
          noOptionsMessage={({ inputValue }) => 
             inputValue.length < 3 ? 'Escribe al menos 3 letras...' : 'No se encontraron pacientes'
          }
          loadingMessage={() => 'Buscando...'}
        />
      </Box>

     
      <Menu>
        <MenuButton as={Box} cursor="pointer">
           {/* Muestra Avatar siempre */}
           <Avatar size={'sm'} name={user?.username || '?'} /> 
           {/* Muestra Nombre solo en Desktop */}
           <Text 
               fontSize="sm" 
               display={{ base: 'none', md: 'inline' }} 
               ml={2}
           >
            {user?.username}
          </Text>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => navigate('/configuracion')}>
            Configuración
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Cerrar Sesión
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default Navbar;