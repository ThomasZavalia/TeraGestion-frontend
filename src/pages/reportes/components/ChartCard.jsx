import { Box, Heading, Center, Spinner, Text } from '@chakra-ui/react';

const ChartCard = ({ title, children, isLoading, error = null, isEmpty = false }) => (
  <Box bg="white" p={5} borderRadius="lg" shadow="md">
    <Heading size="sm" mb={4} color="gray.600">
      {title}
    </Heading>
    <Box minH="250px" display="flex" alignItems="center" justifyContent="center">
      {isLoading ? (
        <Spinner size="xl" />
      ) : error ? (
        <Text color="red.500">Error al cargar datos.</Text>
      ) : isEmpty ? (
         <Text color="gray.500">No hay datos para mostrar.</Text>
      ) : (
        children 
      )}
    </Box>
  </Box>
);

export default ChartCard;