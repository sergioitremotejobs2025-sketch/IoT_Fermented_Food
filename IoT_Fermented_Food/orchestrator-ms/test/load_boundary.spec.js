const request = require('supertest');
const app = require('../src/app/app');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../src/config/jwt.config');

describe('Orchestrator Boundary Propagation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should propagate 422 Unprocessable Entity from measure-ms', async () => {
        const token = jwt.sign({ username: 'Tester' }, TOKEN_SECRET);

        // Mock measure-ms 422 response
        const errorResponse = {
            response: {
                status: 422,
                data: { error: 'Invalid measurement: Humidity value -10 out of bounds (0-1023)' }
            }
        };
        jest.spyOn(axios, 'post').mockRejectedValue(errorResponse);

        const res = await request(app)
            .post('/humidity')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ip: '192.168.1.50',
                username: 'Tester',
                humidity: -10
            });

        expect(res.statusCode).toBe(422);
        expect(res.body.error).toContain('Invalid measurement');
    });
});
