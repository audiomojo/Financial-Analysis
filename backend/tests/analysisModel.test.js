const request = require('supertest');
const express = require('express');
const { setExpenseData, setMappingData } = require('../models/analysisModel');
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

// Helper function to generate test expenses for core vs non-core
const generateCoreVsNonCoreTestExpenses = () => {
    return [
        { date: '2023-01-15', description: 'Costco WHSE', amount: 500 },
        { date: '2023-01-20', description: 'Game Grid', amount: 200 },
        { date: '2023-02-10', description: 'Costco WHSE', amount: 400 },
        { date: '2023-03-12', description: 'Other Store', amount: 300 }, // No mapping
        { date: '2023-03-22', description: 'Costco WHSE', amount: 600 },
        { date: '2023-04-11', description: 'Game Grid', amount: 700 }
    ];
};

// Helper function to generate mappings for core vs non-core expenses
const generateTestMappings = () => {
    return [
        {
            Key: 'Costco WHSE',
            CoreExpense: true,
            Category1: 'Groceries',
            Category1Percentage: 85,
            Category2: 'Clothing',
            Category2Percentage: 10,
            Category3: 'Household',
            Category3Percentage: 5
        },
        {
            Key: 'Game Grid',
            CoreExpense: false,
            Category1: 'MTG',
            Category1Percentage: 100,
            Category2: '',
            Category2Percentage: 0,
            Category3: '',
            Category3Percentage: 0
        }
    ];
};

// Helper function to generate test expenses and mappings for category totals
const generateCategoryTestExpenses = () => {
    return [
        { date: '2023-01-15', description: 'Costco WHSE', amount: 500 },
        { date: '2023-02-20', description: 'Maverik', amount: 200 },
        { date: '2023-03-22', description: 'Game Grid', amount: 600 }
    ];
};

const generateCategoryTestMappings = () => {
    return [
        {
            Key: 'Costco WHSE',
            CoreExpense: true,
            Category1: 'Groceries',
            Category1Percentage: 85,
            Category2: 'Clothing',
            Category2Percentage: 10,
            Category3: 'Household',
            Category3Percentage: 5
        },
        {
            Key: 'Maverik',
            CoreExpense: true,
            Category1: 'Gas',
            Category1Percentage: 95,
            Category2: 'Snacks',
            Category2Percentage: 5,
            Category3: ''
        },
        {
            Key: 'Game Grid',
            CoreExpense: false,
            Category1: 'MTG',
            Category1Percentage: 100
        }
    ];
};

// Set up the Express app for testing
const app = express();
app.use('/api/analysis', analysisRoute);

describe('GET /getMonthlyTotals', () => {
    beforeAll(() => {
        const testExpenses = generateTestExpenses();
        setExpenseData(testExpenses);
    });

    test('should return correct monthly totals for January to December', async () => {
        const expectedTotals = {
            January: 1000,
            February: 1400,
            March: 1800,
            April: 2200,
            May: 2600,
            June: 3000,
            July: 3400,
            August: 3800,
            September: 4200,
            October: 4600,
            November: 5000,
            December: 5400
        };

        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });

    test('should return correct monthly totals for January to August, with zero for September to December', async () => {
        const testExpenses = generateTestExpensesJanToAug();
        setExpenseData(testExpenses);

        const expectedTotals = {
            January: 1000,
            February: 1400,
            March: 1800,
            April: 2200,
            May: 2600,
            June: 3000,
            July: 3400,
            August: 3800,
            September: 0,
            October: 0,
            November: 0,
            December: 0
        };

        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });

    test('should return zero for all months with empty expense dataset', async () => {
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

        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });

    test('should return zero for all months with null expense dataset', async () => {
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

        const response = await request(app).get('/api/analysis/getMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });
});

// New describe block for Core vs Non-Core expense tests
describe('GET /getCoreVsNonCoreExpenseMonthlyTotals', () => {
    beforeAll(() => {
        // Inject test expenses and mappings into the model before running the tests
        const testExpenses = generateCoreVsNonCoreTestExpenses();
        const testMappings = generateTestMappings();
        setExpenseData(testExpenses);
        setMappingData(testMappings);
    });

    test('should return correct core vs non-core monthly totals', async () => {
        const expectedTotals = {
            core: {
                January: 500,   // Only Costco WHSE (Core) for January
                February: 400,  // Only Costco WHSE (Core) for February
                March: 600,     // Only Costco WHSE (Core) for March
                April: 0,
                May: 0,
                June: 0,
                July: 0,
                August: 0,
                September: 0,
                October: 0,
                November: 0,
                December: 0
            },
            nonCore: {
                January: 200,   // Only Game Grid (Non-Core) for January
                February: 0,
                March: 0,
                April: 700,     // Only Game Grid (Non-Core) for April
                May: 0,
                June: 0,
                July: 0,
                August: 0,
                September: 0,
                October: 0,
                November: 0,
                December: 0
            },
            unmapped: {
                January: 0,
                February: 0,
                March: 300, // Only Other Store (Unmapped) for March
                April: 0,
                May: 0,
                June: 0,
                July: 0,
                August: 0,
                September: 0,
                October: 0,
                November: 0,
                December: 0
            }
        };

        const response = await request(app).get('/api/analysis/getCoreVsNonCoreExpenseMonthlyTotals');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });
});

// New describe block for category totals by month
describe('GET /getCategoryTotalsByMonth', () => {
    beforeAll(() => {
        // Inject test expenses and mappings into the model before running the tests
        const testExpenses = generateCategoryTestExpenses();
        const testMappings = generateCategoryTestMappings();
        setExpenseData(testExpenses);
        setMappingData(testMappings);
    });

    test('should return correct category totals by month', async () => {
        const expectedTotals = {
            January: {
                Groceries: 425,   // 85% of 500
                Clothing: 50,     // 10% of 500
                Household: 25     // 5% of 500
            },
            February: {
                Gas: 190,         // 95% of 200
                Snacks: 10        // 5% of 200
            },
            March: {
                MTG: 600          // 100% of 600
            },
            April: {},
            May: {},
            June: {},
            July: {},
            August: {},
            September: {},
            October: {},
            November: {},
            December: {}
        };

        const response = await request(app).get('/api/analysis/getCategoryTotalsByMonth');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedTotals);
    });
});