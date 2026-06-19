const request = require('supertest');
const fc = require('fast-check');
const app = require('../src/app/app');

// Increase timeout for fuzz tests
jest.setTimeout(60000);

describe('API Gateway Fuzz Testing', () => {

    // Helper to ensure we don't hit the rate limit too hard during fuzzing
    // and that supertest doesn't choke on non-serializable inputs.
    const runFuzz = (testFn, options = { numRuns: 20 }) => fc.assert(fc.asyncProperty(testFn), options);

    describe('POST /login', () => {
        it('should handle random objects in body', async () => {
            await fc.assert(
                fc.asyncProperty(fc.object(), async (payload) => {
                    const response = await request(app)
                        .post('/login')
                        .send(payload);

                    expect(response.status).not.toBe(500);
                }),
                { numRuns: 30 }
            );
        });

        it('should handle random strings in credentials', async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), fc.string(), async (username, password) => {
                    const response = await request(app)
                        .post('/login')
                        .send({ username, password });

                    expect(response.status).not.toBe(500);
                }),
                { numRuns: 30 }
            );
        });
    });

    describe('POST /register', () => {
        it('should handle random registration payloads', async () => {
            await fc.assert(
                fc.asyncProperty(fc.object(), async (payload) => {
                    const response = await request(app)
                        .post('/register')
                        .send(payload);

                    expect(response.status).not.toBe(500);
                }),
                { numRuns: 20 }
            );
        });
    });

    describe('GET /humidity', () => {
        it('should handle random query parameters even with invalid tokens', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.dictionary(fc.string(), fc.string()),
                    fc.string(),
                    async (query, token) => {
                        const response = await request(app)
                            .get('/humidity')
                            .query(query)
                            .set('Authorization', `Bearer ${token}`);

                        expect(response.status).not.toBe(500);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('Payload Size Limit', () => {
        it('should handle very large payloads gracefully', async () => {
            const largeObject = {};
            for (let i = 0; i < 500; i++) {
                largeObject[`key_${i}`] = 'A'.repeat(50);
            }

            const response = await request(app)
                .post('/login')
                .send(largeObject);

            expect(response.status).not.toBe(500);
        });
    });
});
