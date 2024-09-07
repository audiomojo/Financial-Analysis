const express = require('express');
const { getMappings} = require('../controllers/mappingController');

const router = express.Router();
router.get('/getMappings', getMappings);

module.exports = router;