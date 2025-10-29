import React, {useRef} from "react";
import { AlertDialog, AlertDialogBody, AlertDialogFooter, 
AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from "@chakra-ui/react";



export const ComfirmarEliminarModal = ({isOpen, onClose, onConfirmar, paciente, isLoading}) => {
    const cancelRef = useRef();

    return(
        <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        >
        <AlertDialogOverlay>
            <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Eliminar Paciente
                </AlertDialogHeader>

                <AlertDialogBody>
                    ¿Estás seguro que deseas eliminar al paciente {paciente?.nombre} {paciente?.apellido}?
                    Esta acción no se puede deshacer.
                </AlertDialogBody>

                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>

                    <Button colorScheme="red" onClick={onConfirmar} isDisabled={isLoading} ml={3}>
                        Eliminar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogOverlay>

        </AlertDialog>
    )
}