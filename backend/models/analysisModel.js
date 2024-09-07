let expenseData = null;

const logger = require("../logger");

const setExpenseData = (data) => {
    expenseData = data;
    logger.info("Injecting expense data into analysisModel... ");
};

const monthlyTotals = () => {
    // Initialize an object with keys for each month and a value of 0
    const totals = {
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

    if (!expenseData || expenseData.length === 0) {
        return totals;  // Return all zeros if expenseData is null or empty
    }

    // Iterate over each expense and sum up the totals for each month
    expenseData.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'long' }); // Get the full month name
        totals[month] += expense.amount;
    });

    return totals; // Return the totals object
};

module.exports = {
    setExpenseData,
    monthlyTotals,
};