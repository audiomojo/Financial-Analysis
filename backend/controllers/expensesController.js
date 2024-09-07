const csv = require('csv-parser');
const fs = require('fs');
const { addExpense, expenses, monthlyTotals} = require('../models/expenseModel');

const getExpenses = (req, res) => {
    res.json(expenses());
};

module.exports = {
    getExpenses,
};
