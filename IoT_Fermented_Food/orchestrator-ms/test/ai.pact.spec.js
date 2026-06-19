const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
jest.unmock('axios');
const axios = require('axios');
const path = require('path');
const { string, integer, like } = MatchersV3;

const provider = new PactV3({
    consumer: 'OrchestratorMS',
    provider: 'AIMS',
    dir: path.resolve(process.cwd(), 'pacts'),
});

describe('OrchestratorMS - AIMS Pact', () => {
    describe('POST /train', () => {
        it('requests AI training', () => {
            provider.addInteraction({
                states: [{ description: 'AI service is available' }],
                uponReceiving: 'a request to train AI',
                withRequest: {
                    method: 'POST',
                    path: '/train',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-api-key': 'testkey'
                    },
                    body: {
                        username: 'testuser',
                        ip: '192.168.1.50',
                        measure: 'humidity',
                        limit: 1000
                    }
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        message: string('Model trained successfully')
                    }
                }
            });

            return provider.executeTest(async (mockserver) => {
                try {
                    const response = await axios.post(`${mockserver.url}/train`, {
                        username: 'testuser',
                        ip: '192.168.1.50',
                        measure: 'humidity',
                        limit: 1000
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-internal-api-key': 'testkey'
                        }
                    });
                    expect(response.status).toEqual(200);
                    expect(response.data.message).toBeDefined();
                } catch (e) {
                    console.error('axios fail (train): ', e.response ? e.response.status : e.message);
                    throw e;
                }
            });
        });
    });

    describe('POST /predict', () => {
        it('requests an AI prediction', () => {
            provider.addInteraction({
                states: [{ description: 'AI model is trained' }],
                uponReceiving: 'a request for an AI prediction',
                withRequest: {
                    method: 'POST',
                    path: '/predict',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-api-key': 'testkey'
                    },
                    body: {
                        username: 'testuser',
                        ip: '192.168.1.50',
                        measure: 'humidity',
                        recent_values: like([50.1, 51.2, 50.5])
                    }
                },
                willRespondWith: {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        prediction: like(52.1)
                    }
                }
            });

            return provider.executeTest(async (mockserver) => {
                try {
                    const response = await axios.post(`${mockserver.url}/predict`, {
                        username: 'testuser',
                        ip: '192.168.1.50',
                        measure: 'humidity',
                        recent_values: [50.1, 51.2, 50.5]
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-internal-api-key': 'testkey'
                        }
                    });
                    expect(response.status).toEqual(200);
                    expect(response.data.prediction).toBeDefined();
                } catch (e) {
                    console.error('axios fail (predict): ', e.response ? e.response.status : e.message);
                    throw e;
                }
            });
        });
    });
});
