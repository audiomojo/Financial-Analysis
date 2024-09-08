const { monthlyTotals, coreVsNonCoreExpenseMonthlyTotals, categoryTotalsByMonth } = require('../models/analysisModel');

// Existing controllers
const getMonthlyTotals = (req, res) => {
    res.json(monthlyTotals(req, res));
};

const getCoreVsNonCoreExpenseMonthlyTotals = (req, res) => {
    res.json(coreVsNonCoreExpenseMonthlyTotals(req, res));
};

// New controller for category totals by month
const getCategoryTotalsByMonth = (req, res) => {
    res.json(categoryTotalsByMonth(req, res));
};

module.exports = {
    getMonthlyTotals,
    getCoreVsNonCoreExpenseMonthlyTotals,
    getCategoryTotalsByMonth  // Export the new controller
};