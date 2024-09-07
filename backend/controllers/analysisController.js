const csv = require('csv-parser');
const fs = require('fs');
const {monthlyTotals} = require('../models/analysisModel');

const getMonthlyTotals = (req, res) => {
    res.json(monthlyTotals(req, res));
};

module.exports = {
    getMonthlyTotals,
};
