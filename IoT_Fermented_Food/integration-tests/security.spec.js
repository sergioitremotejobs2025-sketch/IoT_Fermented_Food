const request = require('supertest');
const axios = require('axios');

const MEASURE_MS_URL = process.env.MEASURE_MS_URL || 'http://localhost:4000';

describe('Service-to-Service Security (Internal API Key)', () => {

    it('should reject requests to measure-ms without INTERNAL_API_KEY', async () => {
        try {
            const res = await axios.get(`${MEASURE_MS_URL}/humidity`);
            // If it succeeds, the test should fail
            fail('Should have failed with 401');
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    });

    it('should accept requests to measure-ms with valid INTERNAL_API_KEY', async () => {
        const res = await axios.get(`${MEASURE_MS_URL}/humidity`, {
            headers: { 'x-internal-api-key': 'testkey' }
        });
        expect(res.status).toBe(200);
    });
});
