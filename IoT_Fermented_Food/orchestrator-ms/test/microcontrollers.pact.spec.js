const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const path = require('path');
const axios = jest.requireActual('axios');

describe('Microcontrollers-MS Pact', () => {
    const pactOpts = {
        consumer: 'OrchestratorMS',
        provider: 'MicrocontrollersMS',
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'INFO',
    };

    const internalKey = 'testkey';

    describe('GET /', () => {
        it('returns microcontrollers for a user', () => {
            const provider = new PactV3(pactOpts);
            const username = 'testuser';

            provider.addInteraction({
                states: [{ description: 'microcontrollers exist' }],
                uponReceiving: 'a request for all microcontrollers for a user',
                withRequest: {
                    method: 'GET',
                    path: '/',
                    query: { username },
                    headers: { 'x-internal-api-key': internalKey },
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: MatchersV3.eachLike({
                        ip: MatchersV3.like('192.168.1.1'),
                        measure: MatchersV3.like('humidity'),
                        sensor: MatchersV3.like('DHT11'),
                        username: username
                    }),
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.get(mockServer.url, {
                    params: { username },
                    headers: { 'x-internal-api-key': internalKey }
                });
                expect(response.status).toBe(200);
                expect(Array.isArray(response.data)).toBe(true);
                expect(response.data[0].username).toBe(username);
            });
        });
    });

    describe('POST /', () => {
        it('creates a new microcontroller', () => {
            const provider = new PactV3(pactOpts);
            const mcu = {
                ip: '192.168.1.50',
                measure: 'temperature',
                sensor: 'DS18B20',
                username: 'testuser'
            };

            provider.addInteraction({
                states: [{ description: 'microcontroller does not exist' }],
                uponReceiving: 'a request to create a microcontroller',
                withRequest: {
                    method: 'POST',
                    path: '/',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-api-key': internalKey
                    },
                    body: mcu,
                },
                willRespondWith: {
                    status: 201,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: mcu,
                },
            });

            return provider.executeTest(async (mockServer) => {
                const response = await axios.post(mockServer.url, mcu, {
                    headers: { 'x-internal-api-key': internalKey }
                });
                expect(response.status).toBe(201);
                expect(response.data.ip).toBe(mcu.ip);
            });
        });
    });
});
