import { useState, useEffect } from "react";
import {useParams} from "react-router-dom";
import {pacienteService} from "../services/PacienteService/PacienteService";

export const usePacienteDetalles = () => {
  // 1. useParams() lee los parámetros de la URL (ej: /pacientes/:id)
  const { id } = useParams(); 

  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDetalles = async () => {
      if (!id) return; 

      setLoading(true);
      try {
        // 2. Llama a la función del servicio
        const data = await pacienteService.getPacienteDetalles(id);
        setDetalles(data);
        setError(null);
      } catch (err) {
        console.error("Error en usePacienteDetalles:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [id]); // 3. Se ejecuta cada vez que el 'id' de la URL cambia

  // 4. Devuelve los datos y los estados
  return { detalles, loading, error };
};