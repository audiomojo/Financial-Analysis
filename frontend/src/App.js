import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';  // Import CSS file
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

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
        amount = 0;  // Default to 0 if the amount is undefined or null
    }
    return `$${amount.toFixed(2)}`;  // Format with $ sign and 2 decimal places
};

// Reusable Widget component
function Widget({ children, className }) {
    return (
        <div className={`widget ${className || ''}`}>
            {children}
        </div>
    );
}

// Reusable Table component
function Table({ data, columns }) {
    return (
        <table>
            <thead>
            <tr>
                {columns.map((col, index) => (
                    <th key={index}>{col.header}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
                <tr key={index}>
                    {columns.map((col, colIndex) => (
                        <td key={colIndex}>{col.render(row)}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}

function App() {
    const [monthlyTotals, setMonthlyTotals] = useState(null);
    const [coreVsNonCoreTotals, setCoreVsNonCoreTotals] = useState(null);
    const [categoryTotals, setCategoryTotals] = useState(null); // for Widget 5
    const [selectedMonth, setSelectedMonth] = useState('January'); // for Widget 5
    const baseURL = process.env.REACT_APP_BACKEND_API_BASE_URL;

    useEffect(() => {
        axios.get(`${baseURL}/analysis/getMonthlyTotals`).then(response => {
            setMonthlyTotals(response.data);
        }).catch(error => {
            console.error('Error fetching monthly totals:', error);
        });

        axios.get(`${baseURL}/analysis/getCoreVsNonCoreExpenseMonthlyTotals`).then(response => {
            setCoreVsNonCoreTotals(response.data);
        }).catch(error => {
            console.error('Error fetching core vs non-core expense totals:', error);
        });

        // Fetch category totals for Widget 5
        axios.get(`${baseURL}/analysis/getCategoryTotalsByMonth`).then(response => {
            setCategoryTotals(response.data);
        }).catch(error => {
            console.error('Error fetching category totals:', error);
        });
    }, [baseURL]);

    // Return early if data hasn't loaded yet
    if (!monthlyTotals || !coreVsNonCoreTotals || !categoryTotals) {
        return <div>Loading...</div>;
    }

    const calculateRunningAverage = (totals) => {
        const runningAverages = [];
        let totalSum = 0;
        let count = 0;

        Object.values(totals).forEach(total => {
            if (total > 0) {
                totalSum += total;
                count++;
                runningAverages.push(totalSum / count);
            } else {
                runningAverages.push(null);
            }
        });

        return runningAverages;
    };

    const calculateAverage = (totals) => {
        const nonZeroTotals = Object.values(totals).filter(total => total > 0);
        const totalSum = nonZeroTotals.reduce((sum, total) => sum + total, 0);
        return nonZeroTotals.length > 0 ? totalSum / nonZeroTotals.length : 0;
    };

    const prepareChartData = () => {
        const labels = Object.keys(monthlyTotals);
        const data = Object.values(monthlyTotals).map(total => total > 0 ? total : 0);

        return {
            labels,
            datasets: [
                {
                    label: 'Monthly Totals',
                    data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    type: 'bar',
                },
                {
                    label: 'Running Average',
                    data: calculateRunningAverage(monthlyTotals),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: false,
                    type: 'line',
                    tension: 0.3,
                    pointRadius: 3,
                }
            ]
        };
    };

    const prepareStackedChartData = () => {
        const labels = Object.keys(coreVsNonCoreTotals.core);
        const coreData = Object.values(coreVsNonCoreTotals.core);
        const nonCoreData = Object.values(coreVsNonCoreTotals.nonCore);
        const unmappedData = Object.values(coreVsNonCoreTotals.unmapped);

        return {
            labels,
            datasets: [
                {
                    label: 'Core Expenses',
                    data: coreData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Light blue for core
                },
                {
                    label: 'Non-Core Expenses',
                    data: nonCoreData,
                    backgroundColor: 'rgba(255, 206, 86, 0.5)', // Yellow for non-core
                },
                {
                    label: 'Unmapped Expenses',
                    data: unmappedData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Light green for unmapped
                },
                {
                    label: 'Core Running Average',
                    data: calculateRunningAverage(coreVsNonCoreTotals.core),
                    type: 'line',
                    borderColor: 'rgba(54, 162, 235, 1)', // Blue for core average
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 2
                },
                {
                    label: 'Non-Core Running Average',
                    data: calculateRunningAverage(coreVsNonCoreTotals.nonCore),
                    type: 'line',
                    borderColor: 'rgba(255, 206, 86, 1)', // Yellow for non-core average
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 2
                }
            ]
        };
    };

    // Prepare data for Widget 5
    const prepareCategoryData = () => {
        const categories = Object.keys(categoryTotals[selectedMonth]);
        const amounts = Object.values(categoryTotals[selectedMonth]);

        return {
            labels: categories,
            datasets: [{
                label: `Categories for ${selectedMonth}`,
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    };

    const handleMonthClick = (month) => {
        setSelectedMonth(month);
    };

    return (
        <div className="App">
            <header>Financial Expense Analysis</header>

            <div className="widgets-container">

                {/* Widget 1: Monthly Totals */}
                <Widget>
                    <h3>Monthly Totals</h3>
                    <Table
                        data={Object.entries(monthlyTotals).filter(([_, total]) => total > 0)}
                        columns={[
                            { header: 'Month', render: ([month]) => month },
                            { header: 'Amount', render: ([_, total]) => formatCurrency(total) }
                        ]}
                    />
                    <div className="widget-footer">
                        Average Monthly Expense: {formatCurrency(calculateAverage(monthlyTotals))}
                    </div>
                </Widget>

                {/* Widget 2: Monthly Totals with Running Average */}
                <Widget className="graph">
                    <h3>Monthly Totals with Running Average</h3>
                    <Bar
                        data={prepareChartData()}
                        options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: value => `$${value.toFixed(2)}`
                                    }
                                }
                            }
                        }}
                    />
                </Widget>

                {/* Widget 3: Core vs Non-Core Totals */}
                <Widget>
                    <h3>Core vs Non-Core Totals</h3>
                    <Table
                        data={Object.keys(coreVsNonCoreTotals.core).filter(month => (
                            coreVsNonCoreTotals.core[month] > 0 ||
                            coreVsNonCoreTotals.nonCore[month] > 0 ||
                            coreVsNonCoreTotals.unmapped[month] > 0
                        ))}
                        columns={[
                            { header: 'Month', render: month => month },
                            { header: 'Core', render: month => formatCurrency(coreVsNonCoreTotals.core[month]) },
                            { header: 'Non-Core', render: month => formatCurrency(coreVsNonCoreTotals.nonCore[month]) },
                            { header: 'Unmapped', render: month => formatCurrency(coreVsNonCoreTotals.unmapped[month]) }
                        ]}
                    />
                    <div className="widget-footer">
                        Averages - Core: {formatCurrency(calculateAverage(coreVsNonCoreTotals.core))},
                        Non-Core: {formatCurrency(calculateAverage(coreVsNonCoreTotals.nonCore))},
                        Unmapped: {formatCurrency(calculateAverage(coreVsNonCoreTotals.unmapped))}
                    </div>
                </Widget>

                {/* Widget 4: Stacked Column Chart */}
                <Widget className="graph">
                    <h3>Core, Non-Core, and Unmapped Stacked Chart with Running Average</h3>
                    <Bar
                        data={prepareStackedChartData()}
                        options={{
                            scales: {
                                y: {
                                    stacked: true,
                                    beginAtZero: true,
                                    ticks: {
                                        callback: value => `$${value.toFixed(2)}`
                                    }
                                },
                                x: {
                                    stacked: true
                                }
                            }
                        }}
                    />
                </Widget>

                {/* Widget 5: Categories by Month */}
                <Widget className="graph widget-5">
                    <h3>Categories By Month: {selectedMonth}</h3>
                    <div className="month-buttons">
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                            <button
                                key={index}
                                className={selectedMonth === month ? 'active' : ''}
                                onClick={() => handleMonthClick(month)}
                            >
                                {month.substring(0, 3).toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <Bar
                        data={prepareCategoryData()}
                        options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: value => `$${value.toFixed(2)}`
                                    }
                                }
                            }
                        }}
                    />
                </Widget>

            </div>
        </div>
    );
}

export default App;