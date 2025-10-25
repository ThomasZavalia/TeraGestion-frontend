
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading,
  Text, InputGroup, InputRightElement, IconButton
} from '@chakra-ui/react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useLoginForm } from '../hooks/useLoginForm'; 

const LoginPage = () => {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    isLoading, handleSubmit,
  } = useLoginForm(); 

  return (
    
    <Box
      minH="100vh"                
      display="flex"             
      alignItems="center"         
      justifyContent="center"      
      bg="gray.50"                 
    >
   
      <Box
        bg="white"
        p="8"
        borderRadius="lg"
        boxShadow="md"
        w="full"
        maxW="md" 
      >
        <VStack spacing="6" align="stretch">
          <Box textAlign="center">
            <Heading size="lg">TeraGestión</Heading>
            <Text color="gray.500">Ingresa a tu cuenta</Text>
          </Box>
          <form onSubmit={handleSubmit}>
            <VStack spacing="4">
            
              <FormControl isRequired>
                <FormLabel>Nombre de Usuario</FormLabel>
                <Input
                  type="text"
                  placeholder="tu-usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
                loadingText="Ingresando..."
              >
                Iniciar Sesión
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;