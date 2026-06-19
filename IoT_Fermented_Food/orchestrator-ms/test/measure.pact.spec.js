const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const path = require('path');
const axios = jest.requireActual('axios');

describe('Measure-MS Pact', () => {
    const pactOpts = {
        consumer: 'OrchestratorMS',
        provider: 'MeasureMS',
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'INFO',
    };

    const internalKey = 'testkey';

    describe('GET /humidity', () => {
        it('returns humidities for a user', () => {
            const provider = new PactV3(pactOpts);
            const username = 'testuser';

            provider.addInteraction({
                states: [{ description: 'measurements exist for user' }],
                uponReceiving: 'a request for humidity measurements',
                withRequest: {
                    method: 'GET',
                    path: '/humidity',
                    query: { username },
                    headers: {
                        'x-internal-api-key': internalKey
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: MatchersV3.eachLike({
                        username: username,
                        ip: MatchersV3.like('192.168.1.1'),
                        real_value: MatchersV3.number(45.5),
                        timestamp: MatchersV3.integer(1587855634077)
                    }),
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.get(`${mockServer.url}/humidity`, {
                    params: { username },
                    headers: { 'x-internal-api-key': internalKey }
                });
                expect(response.status).toBe(200);
                expect(Array.isArray(response.data)).toBe(true);
            });
        });
    });

    describe('POST /humidity', () => {
        it('saves a new humidity measurement', () => {
            const provider = new PactV3(pactOpts);
            const username = 'testuser';
            const body = {
                username,
                ip: '192.168.1.1',
                humidity: 50.5
            };

            provider.addInteraction({
                states: [{ description: 'microcontroller exists' }],
                uponReceiving: 'a request to save humidity',
                withRequest: {
                    method: 'POST',
                    path: '/humidity',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-api-key': internalKey
                    },
                    body: body,
                },
                willRespondWith: {
                    status: 201,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: {
                        username,
                        ip: body.ip,
                        real_value: body.humidity,
                        timestamp: MatchersV3.integer(1587855634077)
                    },
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.post(`${mockServer.url}/humidity`, body, {
                    headers: { 'x-internal-api-key': internalKey }
                });
                expect(response.status).toBe(201);
                expect(response.data.real_value).toBe(50.5);
            });
        });
    });
});
