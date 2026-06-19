const request = require('supertest')
const app = require('../src/app/app')
const axios = require('axios')

let accessToken
const username = 'AI_Tester'
const password = 'password'

describe('AI Orchestration endpoints', () => {
    beforeAll(done => {
        app.set('io', { emit: jest.fn() })
        // Mock login call to auth-ms
        jest.spyOn(axios, 'post').mockResolvedValueOnce({ data: 'true' })

        request(app)
            .post('/login')
            .send({ username, password })
            .end((err, res) => {
                accessToken = res.body.accessToken
                done()
            })
    })

    describe('POST /ai/train', () => {
        it('should delegate training request to AI-MS', async () => {
            const mockResult = { data: 'Training started' }
            jest.spyOn(axios, 'post').mockResolvedValue(mockResult)

            const res = await request(app)
                .post('/ai/train')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ip: '192.168.1.10', measure: 'temperature' })

            expect(res.statusCode).toEqual(200)
            expect(res.body).toEqual(mockResult.data)
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/train'),
                expect.objectContaining({ username, ip: '192.168.1.10', measure: 'temperature', limit: 1000 }),
                expect.any(Object)
            )
        })

        it('should delegate training request with custom limit to AI-MS', async () => {
            const mockResult = { data: 'Training started' }
            jest.spyOn(axios, 'post').mockResolvedValue(mockResult)

            const res = await request(app)
                .post('/ai/train')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ip: '192.168.1.10', measure: 'temperature', limit: 5000 })

            expect(res.statusCode).toEqual(200)
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/train'),
                expect.objectContaining({ username, ip: '192.168.1.10', measure: 'temperature', limit: 5000 }),
                expect.any(Object)
            )
        })
    })

    describe('POST /ai/predict', () => {
        it('should delegate prediction request to AI-MS', async () => {
            const mockResult = { data: { prediction: [25.5, 26.0] } }
            jest.spyOn(axios, 'post').mockResolvedValue(mockResult)

            const res = await request(app)
                .post('/ai/predict')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    ip: '192.168.1.10',
                    measure: 'temperature',
                    recent_values: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
                })

            expect(res.statusCode).toEqual(200)
            expect(res.body).toEqual(mockResult.data)
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/predict'),
                expect.objectContaining({
                    username,
                    ip: '192.168.1.10',
                    measure: 'temperature',
                    recent_values: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
                }),
                expect.any(Object)
            )
        })

        it('should return 502 if AI-MS is unreachable (mocked)', async () => {
            jest.spyOn(axios, 'post').mockRejectedValue(new Error('ECONNREFUSED'))

            const res = await request(app)
                .post('/ai/predict')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ip: '192.168.1.10', measure: 'temperature', recent_values: [1] })

            expect(res.statusCode).toEqual(502)
        })
    })

    describe('POST /ai/evaluate', () => {
        it('should delegate evaluation request to AI-MS', async () => {
            const mockResult = { data: { mae: 0.5, sample_count: 100 } }
            jest.spyOn(axios, 'post').mockResolvedValue(mockResult)

            const res = await request(app)
                .post('/ai/evaluate')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ip: '192.168.1.10', measure: 'temperature' })

            expect(res.statusCode).toEqual(200)
            expect(res.body).toEqual(mockResult.data)
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/evaluate'),
                expect.objectContaining({ username, ip: '192.168.1.10', measure: 'temperature' }),
                expect.any(Object)
            )
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })
})
