const cors = require('cors');
const express = require('express');

const client = require('prom-client');

const app = express();

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default metrics collection
client.collectDefaultMetrics({ register });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers)}`);
    next();
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'microcontrollers-ms' }));

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.use(require('./routes/microcontrollers.routes'));

app.disable('x-powered-by');

module.exports = app;
