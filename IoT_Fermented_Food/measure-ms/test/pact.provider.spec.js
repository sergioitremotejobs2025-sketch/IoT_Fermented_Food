// MOCK EVERYTHING FIRST
jest.mock('../src/database/dao');
jest.mock('../src/modules/microcontrollers.module');
const axios = require('axios');
jest.mock('axios');

const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

// Set up env
process.env.INTERNAL_API_KEY = 'testkey';
process.env.NODE_ENV = 'test';

const Dao = require('../src/database/dao');
const MicrocontrollersModule = require('../src/modules/microcontrollers.module');

// Setup Mocks before requiring app
Dao.prototype.connect = jest.fn();
Dao.prototype.saveHumidity = jest.fn().mockResolvedValue({
    username: 'testuser',
    ip: '192.168.1.1',
    real_value: 50.5,
    timestamp: 1587855634077
});
Dao.prototype.findHumidity = jest.fn().mockResolvedValue([{
    username: 'testuser',
    ip: '192.168.1.1',
    real_value: 45.5,
    timestamp: 1587855634077
}]);

MicrocontrollersModule.prototype.getMicrocontrollers = jest.fn().mockResolvedValue([{
    username: 'testuser',
    ip: '192.168.1.1',
    measure: 'humidity',
    sensor: 'DHT11'
}]);
MicrocontrollersModule.prototype.digitalToReal = jest.fn().mockImplementation((val) => parseFloat(val));

axios.get = jest.fn().mockResolvedValue({ data: { humidity: 45.5 } });
axios.post = jest.fn().mockResolvedValue({ data: { success: true } });

const app = require('../src/app/app');

let server;

describe('Measure-MS Pact Verification', () => {
    beforeAll((done) => {
        server = app.listen(4010, () => {
            console.log('Measure-MS Provider listening on port 4010');
            done();
        });
    });

    afterAll((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    it('validates the expectations of OrchestratorMS', () => {
        const opts = {
            provider: 'MeasureMS',
            providerBaseUrl: 'http://localhost:4010',
            pactUrls: [path.resolve(process.cwd(), '../orchestrator-ms/pacts/OrchestratorMS-MeasureMS.json')],
            stateHandlers: {
                'measurements exist for user': () => Promise.resolve(),
                'microcontroller exists': () => Promise.resolve()
            }
        };

        return new Verifier(opts).verifyProvider().then(output => {
            console.log('Pact Verification Complete!');
        });
    }, 30000);
});
