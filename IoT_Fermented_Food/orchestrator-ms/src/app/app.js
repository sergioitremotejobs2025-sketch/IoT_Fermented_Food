const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

app.set('trust proxy', 1);

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    skip: (req) => {
        const url = req.url;
        return url === '/health' || url === '/metrics' || url.startsWith('/login') || url.startsWith('/register');
    }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: 'Too many login attempts from this IP, please try again after an hour'
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'orchestrator-ms' }));
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.use(globalLimiter);
app.use('/login', authLimiter);
app.use('/register', authLimiter);


const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Orchestrator MS API',
            version: '1.0.0',
            description: 'API documentation for the Orchestrator microservice',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/app/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default metrics collection
client.collectDefaultMetrics({ register });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(require('./routes/orchestrator.routes'))


app.disable('x-powered-by');

module.exports = app;
