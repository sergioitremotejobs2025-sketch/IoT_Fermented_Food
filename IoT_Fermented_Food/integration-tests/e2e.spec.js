const request = require('supertest');
const { login, registerMCU, publishData, trainAI } = require('./utils');
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3000';

jest.setTimeout(120000); // 2 minutes for full E2E run

describe('End-to-End API Integration Tests', () => {
    let authToken = '';
    const testUser = {
        username: 'user_' + Date.now(),
        password: 'Password123!' // Using a strong password for auth-ms
    };


    beforeAll(async () => {
        console.log('Waiting for Orchestrator to be ready...');
        let ready = false;
        let attempts = 0;
        while (!ready && attempts < 30) {
            try {
                // Try to reach a public endpoint or just root
                const res = await request(ORCHESTRATOR_URL).get('/');
                // Orchestrator might return 404 for root but at least it responds
                ready = true;
                console.log('Orchestrator responded! Starting tests...');
            } catch (err) {
                attempts++;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    });

    it('should register a new user successfully', async () => {
        const res = await request(ORCHESTRATOR_URL)
            .post('/register')
            .send(testUser);
        expect([200, 201]).toContain(res.status);
    });

    it('should login and return a valid JWT token', async () => {
        const res = await request(ORCHESTRATOR_URL)
            .post('/login')
            .send(testUser);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');

        authToken = res.body.accessToken;
    });

    it('should perform the full Golden Path: Seed -> Train -> Predict', async () => {
        // 1. MCU Registration
        const uniqueIp = `10.0.0.${Math.floor(Math.random() * 254) + 1}`;
        const mcu = {
            ip: uniqueIp,
            measure: 'temperature',
            sensor: 'Fake Grove - Temperature'
        };

        const mcuRes = await registerMCU(ORCHESTRATOR_URL, authToken, mcu);
        expect(mcuRes.status).toBe(201);


        // 2. Data Seeding (Need 20+ points for ai-ms trainer)
        console.log('Seeding 25 data points...');
        for (let i = 0; i < 25; i++) {
            const pubRes = await publishData(ORCHESTRATOR_URL, authToken, 'temperature', {
                ip: mcu.ip,
                temperature: 20 + Math.random() * 5
            });
            expect([200, 201]).toContain(pubRes.status);

        }

        // 3. AI Training
        console.log('Triggering AI Training...');
        const trainRes = await trainAI(ORCHESTRATOR_URL, authToken, {
            ip: mcu.ip,
            measure: 'temperature'
        });
        expect(trainRes.status).toBe(200);

        // 4. AI Prediction
        console.log('Testing AI Prediction...');
        const predictReq = {
            ip: mcu.ip,
            measure: 'temperature',
            recent_values: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
        };

        const res = await request(ORCHESTRATOR_URL)
            .post('/ai/predict')
            .set('Authorization', `Bearer ${authToken}`)
            .send(predictReq);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('prediction');
        // AI-MS predict returns a float, Orchestrator returns what AI-MS returns
    });

    it('should block unauthenticated access', async () => {
        const res = await request(ORCHESTRATOR_URL).get('/microcontrollers');
        expect(res.status).toBe(401);
    });
});
