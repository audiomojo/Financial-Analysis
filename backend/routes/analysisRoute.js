const express = require('express');
const { getMonthlyTotals, getCoreVsNonCoreExpenseMonthlyTotals, getCategoryTotalsByMonth } = require('../controllers/analysisController');

const router = express.Router();

router.get('/getMonthlyTotals', getMonthlyTotals);
router.get('/getCoreVsNonCoreExpenseMonthlyTotals', getCoreVsNonCoreExpenseMonthlyTotals);
router.get('/getCategoryTotalsByMonth', getCategoryTotalsByMonth);

module.exports = router;