const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const path = require('path');
const axios = jest.requireActual('axios');
const { hashPassword } = require('../src/helpers/helpers');

describe('Auth-MS Pact', () => {
    const pactOpts = {
        consumer: 'OrchestratorMS',
        provider: 'AuthMS',
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'INFO',
    };

    describe('POST /login', () => {
        it('returns "true" for valid credentials', () => {
            const provider = new PactV3(pactOpts);
            const username = 'testuser';
            const password = 'password123';
            const hashedPassword = hashPassword(password);

            provider.addInteraction({
                states: [{ description: 'user exists with valid credentials' }],
                uponReceiving: 'a request for login',
                withRequest: {
                    method: 'POST',
                    path: '/login',
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        username: username,
                        password: hashedPassword,
                        refreshToken: MatchersV3.like('some-token')
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: 'true',
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.post(`${mockServer.url}/login`, {
                    username,
                    password: hashedPassword,
                    refreshToken: 'some-token'
                });
                expect(response.status).toBe(200);
                expect(String(response.data)).toBe('true');
            });
        });
    });

    describe('POST /register', () => {
        it('returns "true" for successful registration', () => {
            const provider = new PactV3(pactOpts);
            const username = 'newuser';
            const password = 'password123';
            const hashedPassword = hashPassword(password);

            provider.addInteraction({
                states: [{ description: 'user does not exist' }],
                uponReceiving: 'a request for registration',
                withRequest: {
                    method: 'POST',
                    path: '/register',
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        username: username,
                        password: hashedPassword,
                        refreshToken: MatchersV3.like('some-token')
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: 'true',
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.post(`${mockServer.url}/register`, {
                    username,
                    password: hashedPassword,
                    refreshToken: 'some-token'
                });
                expect(response.status).toBe(200);
                expect(String(response.data)).toBe('true');
            });
        });
    });

    describe('POST /refresh', () => {
        it('returns "true" for successful token refresh', () => {
            const provider = new PactV3(pactOpts);
            const username = 'testuser';
            const refreshToken = 'old-token';
            const newRefreshToken = 'new-token';

            provider.addInteraction({
                states: [{ description: 'valid refresh tokens' }],
                uponReceiving: 'a request for refresh',
                withRequest: {
                    method: 'POST',
                    path: '/refresh',
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        username,
                        refreshToken,
                        newRefreshToken: MatchersV3.like(newRefreshToken)
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: 'true',
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.post(`${mockServer.url}/refresh`, {
                    username,
                    refreshToken,
                    newRefreshToken
                });
                expect(response.status).toBe(200);
                expect(String(response.data)).toBe('true');
            });
        });
    });

    describe('PUT /change-password', () => {
        it('returns "true" for successful password change', () => {
            const provider = new PactV3(pactOpts);
            const username = 'testuser';
            const password = 'newpassword123';
            const hashedPassword = hashPassword(password);

            provider.addInteraction({
                states: [{ description: 'user exists for password change' }],
                uponReceiving: 'a request for password change',
                withRequest: {
                    method: 'PUT',
                    path: '/change-password',
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        username,
                        password: hashedPassword
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: 'true',
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.put(`${mockServer.url}/change-password`, {
                    username,
                    password: hashedPassword
                });
                expect(response.status).toBe(200);
                expect(String(response.data)).toBe('true');
            });
        });
    });
});
