import { useState, useEffect, use, useCallback} from "react";
import { pacienteService } from "../services/PacienteService/PacienteService";



export const usePacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    
        const cargarPacientes = useCallback (async () => {
            try{
                setLoading(true);
                const data = await pacienteService.getPacientes();
                setPacientes(data);
                setError(null);
            }catch (err){
                console.error("Error al cargar pacientes:", err);
                setError(err);
                setPacientes([]);
            }finally{
                setLoading(false);
            }
        }, []);


        useEffect(() => {
            cargarPacientes();
        }, [cargarPacientes]);
    

    return {pacientes, loading, error, recargarPacientes: cargarPacientes};
}