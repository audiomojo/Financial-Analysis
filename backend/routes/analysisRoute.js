const express = require('express');
const { getMonthlyTotals} = require('../controllers/analysisController');

const router = express.Router();
router.get('/getMonthlyTotals', getMonthlyTotals);

module.exports = router;