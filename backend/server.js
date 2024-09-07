const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { addExpense, addExemptions, expenses} = require('./models/expenseModel');
const { addMapping} = require('./models/mappingModel');
const { setExpenseData, setMappingData } = require('./models/analysisModel');

const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for requests from 'localhost:3000'
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Import routes
const expenseRoutes = require('./routes/expensesRoute');
const mappingRoutes = require('./routes/mappingRoute');
const analysisRoutes = require('./routes/analysisRoute');

// Use routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/mappings', mappingRoutes);
app.use('/api/analysis', analysisRoutes);

// Load the exceptions file into the expenseExceptions array
function loadExpenseExceptions(dataFilePath){
    try {
        const data = fs.readFileSync(dataFilePath, 'utf-8');  // Read the file contents as a string
        expenseExceptions = data.split('\n').map(line => line.trim());  // Split by newlines and trim each line
        addExemptions(expenseExceptions);
        logger.info('Loaded expense exceptions:', expenseExceptions);
    } catch (err) {
        logger.error('Error reading expense exceptions file:', err);
    }
}

// Load CSV file and process data on application start
function loadDataFile(dataFilePath) {
    fs.createReadStream(dataFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data.Debit) {
                addExpense(data);
            }
        })
        .on('end', () => {
            logger.info('CSV file loaded and data processed');
        })
        .on('error', (err) => {
            logger.error(`Error reading CSV file: ${err.message}`);
        });
}

function loadMappingConfig(dataFilePath) {
    fs.createReadStream(dataFilePath)
        .pipe(csv())
        .on('data', (data) => {
            const mapping = {
                Key: Object.values(data)[0], // Fix for CSV parser issue
                CoreExpense: data['CoreExpense'].trim().toUpperCase() === 'Y',
                Category1: data['Category1'],
                Category1Percentage: parseInt(data['Category1Percentage'],10) || 0,
                Category2: data['Category2'],
                Category2Percentage: parseInt(data['Category2Percentage'],10) || 0,
                Category3: data['Category3'],
                Category3Percentage: parseInt(data['Category3Percentage'],10) || 0,
            };
            addMapping(mapping);
        })
        .on('end', () => {
            logger.info('CSV file loaded and data processed');
        })
        .on('error', (err) => {
            logger.error(`Error reading CSV file: ${err.message}`);
        });
}

loadExpenseExceptions(path.join(__dirname, 'configurations/expense-exemptions.txt'));
loadDataFile(path.join(__dirname, 'data/america-first-ytd.csv'));
loadDataFile(path.join(__dirname, 'data/citi-ytd.csv'));
loadMappingConfig(path.join(__dirname, 'configurations/mapping.csv'));

// Catch all other routes and return the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    setExpenseData(expenses());
});