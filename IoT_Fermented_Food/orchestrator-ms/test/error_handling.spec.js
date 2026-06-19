const request = require('supertest');
const app = require('../src/app/app');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../src/config/jwt.config');

jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
}));

describe('Orchestrator Error Handling & Edge Cases', () => {
    let accessToken;

    beforeAll(() => {
        accessToken = jwt.sign({ username: 'Edge_Tester' }, TOKEN_SECRET);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getMeasureService should return 404 if data is missing (Line 34/46)', async () => {
        axios.get.mockResolvedValue({ status: 200 }); // Missing data
        const res = await request(app)
            .get('/temperature')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(404);
    });

    it('postMeasureService should use custom path if provided (Line 50)', async () => {
        axios.post.mockResolvedValue({ data: { success: true }, status: 201 });
        const res = await request(app)
            .post('/temperature')
            .send({ path: 'custom-path', value: 25 })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(201);
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('custom-path'), expect.any(Object), expect.any(Object));
    });

    it('refresh should return 400 if auth-ms returns no data (Line 77)', async () => {
        const payload = { username: 'Edge_Tester', exp: Math.floor(Date.now() / 1000) + 3600 };
        const expiredToken = jwt.sign(payload, TOKEN_SECRET);
        // Note: jwt.module.js isRefreshable checks if exp exists.

        axios.post.mockResolvedValue({ status: 200 }); // Missing data
        const res = await request(app)
            .post('/refresh')
            .send({ refreshToken: 'some-refresh-token' })
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(res.statusCode).toBe(400);
    });

    it('changePassword should return 400 if auth-ms returns no data (Line 127)', async () => {
        axios.put.mockResolvedValue({ status: 200 }); // Missing data
        const res = await request(app)
            .put('/change-password')
            .send({ password: 'new-password' })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(400);
    });

    it('services.controller should return 504 on timeout (Line 37)', async () => {
        const error = new Error('timeout');
        error.code = 'ECONNABORTED';
        axios.get.mockRejectedValue(error);

        const res = await request(app)
            .get('/temperature')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(504);
        expect(res.body.error).toBe('Gateway Timeout');
    });

    it('services.controller should return 404 if response has no data (Line 33)', async () => {
        axios.get.mockResolvedValue({ status: 200 }); // No data property
        const res = await request(app)
            .get('/microcontrollers') // getMicrocontrollers calls without returnResponse
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(404);
    });

    it('services.controller should use default timeout for non-AI train calls (Line 23)', async () => {
        axios.post.mockResolvedValue({ data: { ok: true }, status: 200 });
        await request(app)
            .post('/ai/predict')
            .send({ ip: '1.2.3.4', measure: 'temp', recent_values: [1] })
            .set('Authorization', `Bearer ${accessToken}`);

        // Check that timeout was DEFAULT_TIMEOUT (which is 10000 in config if not overridden)
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({ timeout: 10000 }));
    });

    it('buildHeaders should return empty object if INTERNAL_API_KEY is missing (Line 15)', async () => {
        const originalKey = process.env.INTERNAL_API_KEY;
        delete process.env.INTERNAL_API_KEY;

        // Re-require or just call something that uses it
        // Since it's a constant in the module, we need to reset modules
        jest.isolateModules(async () => {
            const requestNew = require('supertest');
            const appNew = require('../src/app/app');
            const axiosNew = require('axios');
            jest.mock('axios', () => ({ get: jest.fn() })); // Re-mock for the isolated module

            axiosNew.get.mockResolvedValue({ data: { ok: true }, status: 200 });
            await requestNew(appNew)
                .get('/microcontrollers')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(axiosNew.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ headers: {} }));
        });

        process.env.INTERNAL_API_KEY = originalKey;
    });
});
