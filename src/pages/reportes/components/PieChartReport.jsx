import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartCard from './ChartCard';

ChartJS.register(ArcElement, Tooltip, Legend);

// Colores de ejemplo (puedes personalizarlos)
const defaultColors = [
  'rgba(54, 162, 235, 0.7)', // Azul
  'rgba(75, 192, 192, 0.7)', // Verde azulado
  'rgba(255, 206, 86, 0.7)', // Amarillo
  'rgba(255, 99, 132, 0.7)', // Rojo
  'rgba(153, 102, 255, 0.7)',// Morado
  'rgba(255, 159, 64, 0.7)', // Naranja
];

const PieChartReport = ({ title, data, labelField, valueField, isLoading }) => {
   const isEmpty = !data || data.length === 0;

  const chartData = {
    labels: data?.map(item => item[labelField]) || [],
    datasets: [
      {
        label: title, // Usado en Tooltip
        data: data?.map(item => item[valueField]) || [],
        backgroundColor: defaultColors.slice(0, data?.length || 0),
        borderColor: defaultColors.map(color => color.replace('0.7', '1')), // Borde más opaco
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
     plugins: {
      legend: {
        position: 'top', // Posición de la leyenda
      },
      title: { display: false },
    },
  };

  return (
     <ChartCard title={title} isLoading={isLoading} isEmpty={isEmpty}>
      {/* Puedes usar <Doughnut> en lugar de <Pie> si prefieres dona */}
      <Pie options={options} data={chartData} /> 
    </ChartCard>
  );
};

export default PieChartReport;