let mappingData = [];

const logger = require("../logger");

const addMapping = (mapping) => {
    // logger.info('Keys: ' + Object.keys(mapping));
    // logger.info('Values: ' + Object.values(mapping));
    // logger.info('Key: ' + Object.values(mapping)[0]);
    // logger.info('Index of Key: ' + Object.keys(mapping).indexOf('Key',0));
    //
    //
    // logger.info('Mapping Data: Key: ' + mapping.key +
    //     '\tCore Expense: ' + mapping.CoreExpense +
    //     '\tCategory 1: ' + mapping.Category1 +
    //     '\tCategory 1 Percentage: ' + mapping.Category1Percentage +
    //     '\tCategory 2: ' + mapping.Category2 +
    //     '\tCategory 2 Percentage: ' + mapping.Category2Percentage +
    //     '\tCategory 3: ' + mapping.Category3 +
    //     '\tCategory 3 Percentage: ' + mapping.Category3Percentage);
    //

    mappingData.push(mapping);
    const newMapping = mappingData[mappingData.length - 1];

    // logger.info(Object.keys(newMapping));

    logger.info('Mapping Data: Key: ' + newMapping.Key +
        '\tCore Expense: ' + newMapping.CoreExpense +
        '\tCategory 1: ' + newMapping.Category1 +
        '\tCategory 1 Percentage: ' + newMapping.Category1Percentage +
        '\tCategory 2: ' + newMapping.Category2 +
        '\tCategory 2 Percentage: ' + newMapping.Category2Percentage +
        '\tCategory 3: ' + newMapping.Category3 +
        '\tCategory 3 Percentage: ' + newMapping.Category3Percentage);
};

const mappings = () => {
    return mappingData;
};

module.exports = {
    addMapping,
    mappings
};