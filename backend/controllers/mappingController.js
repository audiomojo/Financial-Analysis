const csv = require('csv-parser');
const fs = require('fs');
const { mappings } = require('../models/mappingModel');

const getMappings = (req, res) => {
    res.json(mappings());
};

module.exports = {
    getMappings,
};
