const request = require('supertest');
const express = require('express');
const { setExpenseData } = require('../models/analysisModel');
const analysisRoute = require('../routes/analysisRoute');

// Helper function to generate four expenses per month for January to December
const generateTestExpenses = () => {
    const expenses = [];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthNames.forEach((month, index) => {
        for (let i = 1; i <= 4; i++) {
            const date = `2023-${String(index + 1).padStart(2, '0')}-${String(i + 10).padStart(2, '0')}`;
            expenses.push({
                date: date,
                description: `${month} Expense ${i}`,
                amount: 100 * (i + index), // Predictable amounts
            });
        }
    });

    return expenses;
};

// Helper function to generate expenses only for January to August, zero for September to December
const generateTestExpensesJanToAug = () => {
    const expenses = [];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthNames.forEach((month, index) => {
        if (index < 8) { // Only generate data for January to August
            for (let i = 1; i <= 4; i++) {
                const date = `2023-${String(index + 1).padStart(2, '0')}-${String(i + 10).padStart(2, '0')}`;
                expenses.push({
                    date: date,
                    description: `${month} Expense ${i}`,
                    amount: 100 * (i + index), // Predictable amounts
                });
            }
        }
    });

    return expenses;
};

// Set up the Express app for testing
const app = express();
app.use('/api/analysis', analysisRoute);

describe('GET /getMonthlyTotals', () => {
    beforeAll(() => {
        // Inject the test data into the model before running the tests
        const testExpenses = generateTestExpenses();
        setExpenseData(testExpenses);
    });

    test('should return correct monthly totals for January to December', async () => {
        const expectedTotals = {
            January: 1000,   // 100 + 200 + 300 + 400
            February: 1400,  // 200 + 300 + 400 + 500
            March: 1800,     // 300 + 400 + 500 + 600
            April: 2200,     // 400 + 500 + 600 + 700
            May: 2600,       // 500 + 600 + 700 + 800
            June: 3000,      // 600 + 700 + 800 + 900
            July: 3400,      // 700 + 800 + 900 + 1000
            August: 3800,    // 800 + 900 + 1000 + 1100
            September: 4200, // 900 + 1000 + 1100 + 1200
            October: 4600,   // 1000 + 1100 + 1200 + 1300
            November: 5000,  // 1100 + 1200 + 1300 + 1400
            December: 5400   // 1200 + 1300 + 1400 + 1500
        };

        // Make a GET request to the route and validate the response
        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });

    test('should return correct monthly totals for January to August, with zero for September to December', async () => {
        // Inject data for January to August only
        const testExpenses = generateTestExpensesJanToAug();
        setExpenseData(testExpenses);

        const expectedTotals = {
            January: 1000,   // 100 + 200 + 300 + 400
            February: 1400,  // 200 + 300 + 400 + 500
            March: 1800,     // 300 + 400 + 500 + 600
            April: 2200,     // 400 + 500 + 600 + 700
            May: 2600,       // 500 + 600 + 700 + 800
            June: 3000,      // 600 + 700 + 800 + 900
            July: 3400,      // 700 + 800 + 900 + 1000
            August: 3800,    // 800 + 900 + 1000 + 1100
            September: 0,    // No data for September
            October: 0,      // No data for October
            November: 0,     // No data for November
            December: 0      // No data for December
        };

        // Make a GET request to the route and validate the response
        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });

    // New test: Empty expenses dataset
    test('should return zero for all months with empty expense dataset', async () => {
        // Inject an empty dataset
        setExpenseData([]);

        const expectedTotals = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };

        // Make a GET request to the route and validate the response
        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });

    // New test: Null expenses dataset
    test('should return zero for all months with null expense dataset', async () => {
        // Inject a null dataset
        setExpenseData(null);

        const expectedTotals = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };

        // Make a GET request to the route and validate the response
        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });
});