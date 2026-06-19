const request = require('supertest')
process.env.INTERNAL_API_KEY = 'testkey'
const app = require('../src/app/app')

describe('App endpoints and Rate Limiting', () => {
    it('GET /health should return 200', async () => {
        const res = await request(app).get('/health')
        expect(res.statusCode).toBe(200)
    })

    it('GET /metrics should return 200', async () => {
        const res = await request(app).get('/metrics')
        expect(res.statusCode).toBe(200)
    })

    it('should return 429 after 100 requests to /login', async () => {
        const username = 'RateLimitUser'
        const password = 'password'

        let statusCode = 200
        for (let i = 0; i < 101; i++) {
            const res = await request(app).post('/login').send({ username, password })
            if (res.statusCode === 429) {
                statusCode = 429
                break
            }
        }
        expect(statusCode).toBe(429)
    })

    it('should return 401 for an utterly invalid jwt token format', async () => {
        const res = await request(app)
            .get('/microcontrollers')
            .set('Authorization', 'Bearer invalid-token-format')

        expect(res.statusCode).toBe(401)
    })

    it('should forward non-UnauthorizedErrors to the default error handler', async () => {
        // Test the internal router error handler directly
        const router = require('../src/app/routes/orchestrator.routes');
        
        // Find the error handler in the router stack
        const errorHandlerLayer = router.stack.find(s => s.handle && s.handle.length === 4);
        const errorHandler = errorHandlerLayer ? errorHandlerLayer.handle : null;

        if (!errorHandler) {
            throw new Error('Could not find error handler in router stack');
        }

        const mockError = new Error('Generic Error');
        mockError.name = 'GenericError';
        const mockReq = {};
        const mockRes = { sendStatus: jest.fn() };
        const mockNext = jest.fn();

        errorHandler(mockError, mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(mockError);
        expect(mockRes.sendStatus).not.toHaveBeenCalled();
    })
})
