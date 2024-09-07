let expenseData = [];
let expenseExemptions = [];

const logger = require("../logger");

const addExemptions = (exemptions) => {
    expenseExemptions.push(...exemptions);
    logger.info("Adding Exemptions: " + exemptions);
}

const addExpense = (expense) => {
    const description = expense.Description.toLowerCase(); // Convert to lowercase for case-insensitive comparison

    // Check if the description contains any of the exception strings
    const isExemption = expenseExemptions.some(exemption => {
        // Ensure the exemption is a string
        if (typeof exemption === 'string') {
            return description.includes(exemption.toLowerCase());
        }
        return false;
    });

    // If the description contains any of the exception strings, don't add the expense
    if (isExemption) {
        logger.info('Expense skipped due to exception: ' + expense.Description);
        return;
    }

    // Otherwise, add the expense to expenseData
    expenseData.push({
        date: expense.Date,
        description: expense.Description,
        amount: Math.abs(parseFloat(expense.Debit) || 0)
    });

    logger.info('Expense Transaction: Date: ' + expenseData[expenseData.length - 1].date + '\tDescription: ' + expenseData[expenseData.length - 1].description + '\tAmount: ' + expenseData[expenseData.length - 1].amount);
};

const expenses = () => {
    return expenseData;
};

module.exports = {
    addExpense,
    expenses,
    addExemptions,
};