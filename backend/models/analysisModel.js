let expenseData = null;
let mappingData = null;

const logger = require("../logger");

const setExpenseData = (data) => {
    expenseData = data;
    logger.info("Injecting expense data into analysisModel... ");
};

const setMappingData = (data) => {
    mappingData = data;
    logger.info("Injecting mapping data into analysisModel... ");
};

// Existing monthlyTotals function
const monthlyTotals = () => {
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
        return totals;
    }

    expenseData.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'long' });
        totals[month] += expense.amount;
    });

    return totals;
};

// Existing coreVsNonCoreExpenseMonthlyTotals function
const coreVsNonCoreExpenseMonthlyTotals = () => {
    const totals = {
        core: { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        nonCore: { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 },
        unmapped: { January: 0, February: 0, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0 }
    };

    if (!expenseData || !mappingData) {
        return totals;
    }

    expenseData.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'long' });

        const mapping = mappingData.find(mapping =>
            expense.description.toLowerCase().includes(mapping.Key.toLowerCase())
        );

        if (mapping) {
            if (mapping.CoreExpense) {
                totals.core[month] += expense.amount;
            } else {
                totals.nonCore[month] += expense.amount;
            }
        } else {
            totals.unmapped[month] += expense.amount;
            logger.info(`Unmapped expense added: ${expense.description} ($${expense.amount})`);
        }
    });

    return totals;
};

const categoryTotalsByMonth = () => {
    const monthlyCategoryTotals = {
        January: {}, February: {}, March: {}, April: {}, May: {}, June: {}, July: {}, August: {}, September: {}, October: {}, November: {}, December: {}
    };

    if (!expenseData || !mappingData) {
        return monthlyCategoryTotals;
    }

    expenseData.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'long' });

        const mapping = mappingData.find(mapping =>
            expense.description.toLowerCase().includes(mapping.Key.toLowerCase())
        );

        if (mapping) {
            const category1Amount = expense.amount * (mapping.Category1Percentage / 100);
            const category2Amount = expense.amount * (mapping.Category2Percentage / 100);
            const category3Amount = expense.amount * (mapping.Category3Percentage / 100);

            if (category1Amount > 0) {
                monthlyCategoryTotals[month][mapping.Category1] = (monthlyCategoryTotals[month][mapping.Category1] || 0) + category1Amount;
            }
            if (category2Amount > 0) {
                monthlyCategoryTotals[month][mapping.Category2] = (monthlyCategoryTotals[month][mapping.Category2] || 0) + category2Amount;
            }
            if (category3Amount > 0) {
                monthlyCategoryTotals[month][mapping.Category3] = (monthlyCategoryTotals[month][mapping.Category3] || 0) + category3Amount;
            }
        }
    });

    // Sort each month's categories by total in descending order
    Object.keys(monthlyCategoryTotals).forEach(month => {
        monthlyCategoryTotals[month] = Object.fromEntries(
            Object.entries(monthlyCategoryTotals[month]).sort(([, a], [, b]) => b - a)
        );
    });

    return monthlyCategoryTotals;
};

module.exports = {
    setExpenseData,
    setMappingData,
    monthlyTotals,
    coreVsNonCoreExpenseMonthlyTotals,
    categoryTotalsByMonth  // Export the new function
};