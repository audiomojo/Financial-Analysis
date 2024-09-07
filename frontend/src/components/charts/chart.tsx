import React, { useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,     // Import ArcElement for pie/doughnut charts
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Properly register all necessary components for Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,     // Registering ArcElement here
    Title,
    Tooltip,
    Legend
);

const ChartComponent = () => {
    useEffect(() => {
        let chartInstance = null;

        const renderChart = () => {
            const ctx = document.getElementById('myChart') as HTMLCanvasElement;
            if (chartInstance) {
                chartInstance.destroy();  // Destroy the existing chart before rendering a new one
            }
            chartInstance = new ChartJS(ctx, {
                type: 'doughnut',  // Use 'doughnut' or 'pie' for circular charts
                data: {
                    labels: ['Red', 'Blue', 'Yellow'],
                    datasets: [
                        {
                            label: 'Dataset 1',
                            data: [300, 50, 100],
                            backgroundColor: ['red', 'blue', 'yellow']
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Doughnut Chart Example'
                        }
                    }
                }
            });
        };

        renderChart();

        return () => {
            if (chartInstance) {
                chartInstance.destroy();  // Cleanup chart when component unmounts
            }
        };
    }, []);

    return <canvas id="myChart" width="400" height="400"></canvas>;
};

export default ChartComponent;