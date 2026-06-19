const request = require('supertest')
const { app, setStartTime, STAGES } = require('../src/index')

describe('GET /health', () => {
    it('should return 200 with ok status', async () => {
        const res = await request(app).get('/health')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ status: 'ok', service: 'fake-arduino-iot-pictures' })
    })
})

describe('GET /pictures', () => {
    it('should return correct shape', async () => {
        const res = await request(app).get('/pictures')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual(expect.objectContaining({
            pictures: expect.any(Number),
            stage: expect.any(String),
            stage_id: expect.any(Number),
            elapsed_minutes: expect.any(String),
            image_url: expect.any(String)
        }))
    })

    it('should return stage 1 (seedling) when just started', async () => {
        setStartTime(Date.now())
        const res = await request(app).get('/pictures')
        expect(res.statusCode).toBe(200)
        expect(res.body.stage).toBe('seedling')
        expect(res.body.stage_id).toBe(1)
    })

    it('should return stage 5 (ripe_fruit) after all stages elapsed', async () => {
        // Total duration = 1+2+2+3+5 = 13 minutes; set start 14 min in the past
        setStartTime(Date.now() - 14 * 60 * 1000)
        const res = await request(app).get('/pictures')
        expect(res.statusCode).toBe(200)
        expect(res.body.stage).toBe('ripe_fruit')
        expect(res.body.stage_id).toBe(5)
    })

    it('image_url should contain the stage file name', async () => {
        setStartTime(Date.now())
        const res = await request(app).get('/pictures')
        expect(res.body.image_url).toContain('stage_1.png')
    })

    it('pictures field equals stage_id', async () => {
        const res = await request(app).get('/pictures')
        expect(res.body.pictures).toBe(res.body.stage_id)
    })
})

describe('GET /camera/latest', () => {
    it('should return stage info without pictures field', async () => {
        setStartTime(Date.now())
        const res = await request(app).get('/camera/latest')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual(expect.objectContaining({
            stage: expect.any(String),
            stage_id: expect.any(Number),
            elapsed_minutes: expect.any(String),
            image_url: expect.any(String)
        }))
        expect(res.body.pictures).toBeUndefined()
    })
})

describe('GET /temperature', () => {
    it('should return temperature as stage_id * 10', async () => {
        setStartTime(Date.now())
        const res = await request(app).get('/temperature')
        expect(res.statusCode).toBe(200)
        expect(res.body.temperature).toBe(10) // stage 1 * 10
    })

    it('should return 50 at ripe_fruit stage', async () => {
        setStartTime(Date.now() - 14 * 60 * 1000)
        const res = await request(app).get('/temperature')
        expect(res.body.temperature).toBe(50) // stage 5 * 10
    })
})

describe('STAGES configuration', () => {
    it('should have 5 stages in sequence', () => {
        expect(STAGES).toHaveLength(5)
        expect(STAGES.map(s => s.id)).toEqual([1, 2, 3, 4, 5])
        expect(STAGES.map(s => s.name)).toEqual([
            'seedling', 'young_plant', 'flowering', 'green_fruit', 'ripe_fruit'
        ])
    })

    it('each stage should have required fields', () => {
        STAGES.forEach(stage => {
            expect(stage).toHaveProperty('id')
            expect(stage).toHaveProperty('name')
            expect(stage).toHaveProperty('file')
            expect(stage).toHaveProperty('duration_min')
        })
    })
})
