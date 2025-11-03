import React, { useRef } from "react";
import { AlertDialog, AlertDialogBody, AlertDialogFooter, 
AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from "@chakra-ui/react";

// --- ARREGLO 1: Cambiamos las props ---
// Sacamos 'paciente' y agregamos 'title' y 'children'
export const ComfirmarEliminarModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, // (Me aseguré de usar 'onConfirm' sin 'a')
  isLoading, 
  title, 
  children,
  leastDestructiveRef 
}) => {

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={leastDestructiveRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {/* --- ARREGLO 2: Usamos la prop 'title' --- */}
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>
            {/* --- ARREGLO 3: Usamos 'children' --- */}
            {/* 'children' es el texto que le pasamos desde la página */}
            {children}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={leastDestructiveRef} onClick={onClose} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={onConfirm} isDisabled={isLoading} ml={3}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};