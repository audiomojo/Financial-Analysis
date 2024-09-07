import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

function App() {
    const [monthlyTotals, setMonthlyTotals] = useState(null);
    const baseURL = process.env.REACT_APP_BACKEND_API_BASE_URL;

    useEffect(() => {
        // Fetch the monthly totals data from the backend API
        axios.get(`${baseURL}/analysis/getMonthlyTotals`).then(response => {
            setMonthlyTotals(response.data);
        }).catch(error => {
            console.error('Error fetching monthly totals:', error);
        });
    }, []);

    // Format amount with $ sign and two decimal places
    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    // Calculate the running average for the months with non-zero totals
    const calculateRunningAverage = () => {
        if (!monthlyTotals) return [];
        const runningAverages = [];
        let totalSum = 0;
        let count = 0;

        Object.values(monthlyTotals).forEach(total => {
            if (total > 0) {
                totalSum += total;
                count++;
                runningAverages.push(totalSum / count);  // Calculate running average
            } else {
                runningAverages.push(null);  // Use null to not display points for zero months
            }
        });

        return runningAverages;
    };

    // Calculate the average of non-zero monthly totals
    const calculateAverage = () => {
        if (!monthlyTotals) return 0;
        const nonZeroTotals = Object.values(monthlyTotals).filter(total => total > 0);
        const totalSum = nonZeroTotals.reduce((sum, total) => sum + total, 0);
        return nonZeroTotals.length > 0 ? totalSum / nonZeroTotals.length : 0;
    };

    // Prepare chart data
    const prepareChartData = () => {
        if (!monthlyTotals) return {};

        const labels = Object.keys(monthlyTotals);  // Month names as labels
        const data = Object.values(monthlyTotals).map(total => total > 0 ? total : 0);  // Bar chart data

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Monthly Totals',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',  // Light blue color for bars
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    type: 'bar',
                },
                {
                    label: 'Running Average',
                    data: calculateRunningAverage(),
                    borderColor: 'rgba(255, 99, 132, 1)',  // Red line for running average
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    tension: 0.3,  // Smoothness of the line
                    pointRadius: 3,
                }
            ]
        };
    };

    return (
        <div className="App">
            <header style={{ textAlign: 'center', padding: '20px', fontSize: '24px', fontWeight: 'bold' }}>
                Financial Expense Analysis
            </header>

            {/* Responsive widget container */}
            <div className="widgets-container" style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '20px',  // Space between the widgets
            }}>

                {/* First Widget: Text Totals */}
                <div className="widget" style={{
                    width: '500px',
                    height: '500px',
                    backgroundColor: '#e0f7fa',  // Light blue background
                    borderRadius: '10px',
                    padding: '20px',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',  // Stack content and average footer
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ textAlign: 'center' }}>Monthly Totals</h3>
                        {monthlyTotals ? (
                            <table style={{
                                width: '100%',
                                textAlign: 'left',
                                borderCollapse: 'collapse',
                                tableLayout: 'auto',
                                margin: '0 auto',
                            }}>
                                <tbody>
                                {Object.entries(monthlyTotals)
                                    .filter(([month, total]) => total > 0)  // Filter out totals less than or equal to zero
                                    .map(([month, total]) => (
                                        <tr key={month}>
                                            <td style={{
                                                fontWeight: 'bold',
                                                color: 'black',
                                                padding: '10px'
                                            }}>
                                                {month}
                                            </td>
                                            <td style={{
                                                color: 'black',
                                                padding: '10px',
                                                textAlign: 'right',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {formatCurrency(total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            'Loading...'
                        )}
                    </div>

                    {/* Footer for average monthly expense */}
                    <div style={{
                        backgroundColor: '#90caf9',  // Medium blue background
                        padding: '15px',
                        borderRadius: '8px',
                        marginTop: '20px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'black'
                    }}>
                        Average Monthly Expense: {formatCurrency(calculateAverage())}
                    </div>
                </div>

                {/* Second Widget: Column Graph */}
                <div className="widget" style={{
                    width: '500px',
                    height: '500px',
                    backgroundColor: '#fff9c4',  // Light yellow background for the widget
                    borderRadius: '10px',
                    padding: '20px',
                }}>
                    <h3 style={{ textAlign: 'center' }}>Monthly Totals with Running Average</h3>
                    {monthlyTotals ? (
                        <Bar
                            data={prepareChartData()}
                            options={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: function (value) {
                                                return `$${value.toFixed(2)}`;  // Format Y-axis labels as currency
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        'Loading...'
                    )}
                </div>

            </div>
        </div>
    );
}

export default App;