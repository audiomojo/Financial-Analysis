const express = require('express');
const { getExpenses} = require('../controllers/expensesController');

const router = express.Router();
router.get('/getExpenses', getExpenses);

module.exports = router;