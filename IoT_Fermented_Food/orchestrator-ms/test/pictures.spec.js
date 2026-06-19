const request = require('supertest')
const app = require('../src/app/app')

let accessToken
const username = 'Rocky'
const password = 'password'

describe('Pictures endpoints', () => {
    beforeAll(done => {
        request(app)
            .post('/login')
            .send({ username, password })
            .end((err, res) => {
                accessToken = res.body.accessToken
                done()
            })
    })

    it('GET /pictures without token should return 401', async () => {
        const res = await request(app).get('/pictures')
        expect(res.statusCode).toBe(401)
    })

    it('GET /pictures with token should return 200 and picture data', async () => {
        const res = await request(app)
            .get('/pictures')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    ip: expect.any(String),
                    measure: expect.any(String),
                    sensor: expect.any(String),
                    username: expect.any(String),
                    stage: expect.any(String),
                    stage_id: expect.any(Number),
                    image_url: expect.any(String)
                })
            ])
        )
    }, 10000)

    it('GET /pictures/history with token should return 200', async () => {
        const res = await request(app)
            .get('/pictures?path=pictures/history&ip=192.168.1.50&init_timestamp=0&end_timestamp=9999999999999')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(res.statusCode).toBe(200)
    }, 10000)
})

describe('Health endpoint', () => {
    it('GET /health should return 200 without auth', async () => {
        const res = await request(app).get('/health')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ status: 'ok', service: 'orchestrator-ms' })
    })
})
