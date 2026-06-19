// MOCK EVERYTHING FIRST
jest.mock('../src/database/dao');
const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

// Set up env
process.env.INTERNAL_API_KEY = 'testkey';
process.env.NODE_ENV = 'test';

const Dao = require('../src/database/dao');

// Setup Dao mock
Dao.prototype.findByUsername = jest.fn().mockResolvedValue([{
    ip: '192.168.1.1',
    measure: 'humidity',
    sensor: 'DHT11',
    username: 'testuser'
}]);
Dao.prototype.insertMicrocontroller = jest.fn().mockResolvedValue(1);

const app = require('../src/app/app');

let server;

describe('Microcontrollers-MS Pact Verification', () => {
    beforeAll((done) => {
        server = app.listen(4020, () => {
            console.log('Microcontrollers-MS Provider listening on port 4020');
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
            provider: 'MicrocontrollersMS',
            providerBaseUrl: 'http://localhost:4020',
            pactUrls: [path.resolve(process.cwd(), '../orchestrator-ms/pacts/OrchestratorMS-MicrocontrollersMS.json')],
            stateHandlers: {
                'microcontrollers exist': () => Promise.resolve(),
                'microcontroller does not exist': () => Promise.resolve()
            }
        };

        return new Verifier(opts).verifyProvider().then(output => {
            console.log('Pact Verification Complete!');
        });
    }, 30000);
});
