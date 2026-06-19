const request = require('supertest');
const express = require('express');
const MicrocontrollersController = require('../../src/app/controllers/microcontrollers.controller');

jest.mock('../../src/database/dao', () => {
    return jest.fn().mockImplementation(() => {
        return {
            pairMicrocontroller: jest.fn().mockResolvedValue(true)
        };
    });
});

describe('Microcontrollers Controller - Pairing Protocol', () => {
    let app;
    let microcontrollersController;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        microcontrollersController = new MicrocontrollersController();

        // Route
        app.post('/api/microcontrollers/pair', microcontrollersController.pairMicrocontroller);
    });

    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks();
    });

    test('should register a gateway device via POST /api/microcontrollers/pair', async () => {
        const payload = {
            ip: '192.168.1.100',
            measure: 'gateway',
            sensor: 'hub',
            gateway_id: 'site-alpha'
        };

        const response = await request(app)
            .post('/api/microcontrollers/pair')
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'paired');
        expect(response.body).toHaveProperty('ip', '192.168.1.100');
        expect(response.body).toHaveProperty('gateway_id', 'site-alpha');
    });
});
