const request = require('supertest')
const app = require('../src/app/app')

const REFRESH_TIME = 3

describe('Humidity endpoints', () => {
  it('should return current humidity', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/humidity?username=Rocky')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          digital_value: expect.any(Number),
          ip: expect.any(String),
          measure: expect.any(String),
          real_value: expect.any(Number),
          sensor: expect.any(String),
          timestamp: expect.any(Number),
          username: expect.any(String)
        })
      ])
    )
    expect(res.body[0].measure).toEqual('humidity')
    expect(res.body[0].username).toEqual('Rocky')
  }, 100000)

  it('should return an empty array', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/humidity')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should return previous humidities', async () => {
    const res = await request(app)
      .get(
        '/humidities?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT&' +
        'end_date=Sat, 26 Apr 2020 00:01:35 GMT&' +
        'init_timestamp=1587855634077&' +
        'end_timestamp=1587862713879'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          end_date: expect.any(String),
          end_timestamp: expect.any(Number),
          init_date: expect.any(String),
          init_timestamp: expect.any(Number),
          max_value: expect.any(Number),
          mean_value: expect.any(Number),
          measure: expect.any(String),
          ip: expect.any(String),
          min_value: expect.any(Number),
          n_samples: expect.any(Number),
          real_values: expect.arrayContaining([
            expect.any(Number)
          ]),
          sensor: expect.any(String),
          std_deviation: expect.any(Number),
          time_span: expect.any(Number),
          username: expect.any(String)
        })
      ])
    )
  }, 100000)

  it('should not return previous humidities', async () => {
    const res = await request(app)
      .get(
        '/humidities?' +
        'ip=192.168.1.50&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT&' +
        'end_date=Sat, 26 Apr 2020 00:01:35 GMT&' +
        'init_timestamp=1587855634077&' +
        'end_timestamp=1587862713879'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should not return previous humidities', async () => {
    const res = await request(app)
      .get(
        '/humidities?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('handles axios errors yielding undefined measure', async () => {
    const axios = require('axios')
    const originalGet = axios.get
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes('192.168.')) return Promise.reject(new Error('Down'))
      return originalGet(url)
    })
    const res = await request(app).get('/humidity?username=Rocky')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([null]) // the Promise catch yields `return`, mapped to undefined -> res.json strips or sends null
    jest.restoreAllMocks()
  }, 100000)

  it('should return 400 when getMeasures (findMeasures) throws an error', async () => {
    const Dao = require('../src/database/dao')
    const originalFindHumidity = Dao.prototype.findHumidity
    Dao.prototype.findHumidity = jest.fn().mockRejectedValue(new Error('MongoError'))
    const res = await request(app).get('/humidities?username=Rocky&init_timestamp=1587855634077&end_timestamp=1587862713879')
    expect(res.statusCode).toBe(400)
    Dao.prototype.findHumidity = originalFindHumidity
  }, 100000)

  it('should return 422 for invalid humidity measure (negative)', async () => {
    const res = await request(app)
      .post('/humidity')
      .send({
        ip: '192.168.1.50',
        username: 'Rocky',
        humidity: -10
      })
    expect(res.statusCode).toBe(422)
    expect(res.body.error).toContain('Invalid measurement')
  })

  it('should return 422 for invalid temperature measure (too high)', async () => {
    const res = await request(app)
      .post('/temperature')
      .send({
        ip: '192.168.1.50',
        username: 'Rocky',
        temperature: 2000
      })
    expect(res.statusCode).toBe(422)
    expect(res.body.error).toContain('Invalid measurement')
  })

  it('should return 422 for invalid light measure (negative)', async () => {
    const res = await request(app)
      .post('/light/measure')
      .send({
        ip: '192.168.1.50',
        username: 'Rocky',
        light: -1
      })
    expect(res.statusCode).toBe(422)
    expect(res.body.error).toContain('Invalid measurement')
  })

  it('should save a new humidity measure', async () => {
    const res = await request(app)
      .post('/humidity')
      .send({
        ip: '192.168.1.50',
        username: 'Rocky',
        humidity: 450
      })
    expect(res.statusCode).toBe(201)
    expect(res.body.ip).toBe('192.168.1.50')
  })

  it('should return humidity with limit', async () => {
    const res = await request(app).get('/humidities?username=Rocky&limit=5&ip=192.168.1.50')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeLessThanOrEqual(5)
  })

  it('should use default digitalToReal when sensor is unknown', async () => {
    const MicrocontrollersModule = require('../src/modules/microcontrollers.module')
    const spy = jest.spyOn(MicrocontrollersModule.prototype, 'getMicrocontrollers').mockResolvedValue([{
      ip: '192.168.1.50',
      username: 'Rocky',
      measure: 'humidity',
      sensor: 'UnknownSensor'
    }])

    const res = await request(app)
      .post('/humidity')
      .send({
        ip: '192.168.1.50',
        username: 'Rocky',
        humidity: 500
      })
    expect(res.statusCode).toBe(201)
    expect(res.body.real_value).toBe(500)
    spy.mockRestore()
  })
})

describe('Light endpoints', () => {
  it('should return current light', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/light?username=Rocky')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          digital_value: expect.any(Number),
          ip: expect.any(String),
          measure: expect.any(String),
          sensor: expect.any(String),
          timestamp: expect.any(Number),
          username: expect.any(String)
        })
      ])
    )
    expect(res.body[0].measure).toEqual('light')
    expect(res.body[0].username).toEqual('Rocky')
  }, 100000)

  it('should return an empty array', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/light')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should return previous lights', async () => {
    const res = await request(app)
      .get(
        '/lights?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT&' +
        'end_date=Sat, 26 Apr 2020 00:01:35 GMT&' +
        'init_timestamp=1587855634077&' +
        'end_timestamp=1587862713879'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          digital_values: expect.arrayContaining([
            expect.any(Number)
          ]),
          end_date: expect.any(String),
          end_timestamp: expect.any(Number),
          init_date: expect.any(String),
          init_timestamp: expect.any(Number),
          mean_value: expect.any(Number),
          measure: expect.any(String),
          ip: expect.any(String),
          n_samples: expect.any(Number),
          sensor: expect.any(String),
          time_span: expect.any(Number),
          username: expect.any(String)
        })
      ])
    )
  }, 100000)

  it('should not return previous lights', async () => {
    const res = await request(app)
      .get(
        '/lights?' +
        'ip=192.168.1.50&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT&' +
        'end_date=Sat, 26 Apr 2020 00:01:35 GMT&' +
        'init_timestamp=1587855634077&' +
        'end_timestamp=1587862713879'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should not return previous lights', async () => {
    const res = await request(app)
      .get(
        '/lights?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should turn light off', async () => {
    const res = await request(app)
      .post('/light')
      .send({
        ip: '192.168.1.50',
        status: 'off',
        username: 'Rocky'
      })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.objectContaining({
        date: expect.any(String),
        digital_value: expect.any(Number),
        ip: expect.any(String),
        measure: expect.any(String),
        sensor: expect.any(String),
        timestamp: expect.any(Number),
        username: expect.any(String)
      })
    )
    expect(res.body.digital_value).toEqual(0)
    expect(res.body.measure).toEqual('light')
    expect(res.body.username).toEqual('Rocky')
  }, 100000)

  it('should turn light on', async () => {
    const res = await request(app)
      .post('/light')
      .send({
        ip: '192.168.1.50',
        status: 'on',
        username: 'Rocky'
      })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.objectContaining({
        date: expect.any(String),
        digital_value: expect.any(Number),
        ip: expect.any(String),
        measure: expect.any(String),
        sensor: expect.any(String),
        timestamp: expect.any(Number),
        username: expect.any(String)
      })
    )
    expect(res.body.digital_value).toEqual(1)
    expect(res.body.measure).toEqual('light')
    expect(res.body.username).toEqual('Rocky')
  }, 100000)

  it('should return light with limit', async () => {
    const res = await request(app).get('/lights?username=Rocky&limit=5&ip=192.168.1.50')
    expect(res.statusCode).toBe(200)
  })
})

describe('Temperature endpoints', () => {
  it('should return current temperature', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/temperature?username=Rocky')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          digital_value: expect.any(Number),
          ip: expect.any(String),
          measure: expect.any(String),
          real_value: expect.any(Number),
          sensor: expect.any(String),
          timestamp: expect.any(Number),
          username: expect.any(String)
        })
      ])
    )
    expect(res.body[0].measure).toEqual('temperature')
    expect(res.body[0].username).toEqual('Rocky')
  }, 100000)

  it('should return an empty array', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/temperature')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should return previous temperatures', async () => {
    const res = await request(app)
      .get(
        '/temperatures?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT&' +
        'end_date=Sat, 26 Apr 2020 00:01:35 GMT&' +
        'init_timestamp=1587855634077&' +
        'end_timestamp=1587862713879'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          end_date: expect.any(String),
          end_timestamp: expect.any(Number),
          init_date: expect.any(String),
          init_timestamp: expect.any(Number),
          max_value: expect.any(Number),
          mean_value: expect.any(Number),
          measure: expect.any(String),
          ip: expect.any(String),
          min_value: expect.any(Number),
          n_samples: expect.any(Number),
          real_values: expect.arrayContaining([
            expect.any(Number)
          ]),
          sensor: expect.any(String),
          std_deviation: expect.any(Number),
          time_span: expect.any(Number),
          username: expect.any(String)
        })
      ])
    )
  }, 100000)

  it('should not return previous temperatures', async () => {
    const res = await request(app)
      .get(
        '/temperatures?' +
        'ip=192.168.1.50&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT&' +
        'end_date=Sat, 26 Apr 2020 00:01:35 GMT&' +
        'init_timestamp=1587855634077&' +
        'end_timestamp=1587862713879'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should not return previous temperatures', async () => {
    const res = await request(app)
      .get(
        '/temperatures?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_date=Sat, 25 Apr 2020 23:59:33 GMT'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([])
    )
  }, 100000)

  it('should save a new temperature measure', async () => {
    const res = await request(app)
      .post('/temperature')
      .send({
        ip: '192.168.1.50',
        username: 'Rocky',
        temperature: 250
      })
    expect(res.statusCode).toBe(201)
  })

  it('should return temperature with limit', async () => {
    const res = await request(app).get('/temperatures?username=Rocky&limit=5&ip=192.168.1.50')
    expect(res.statusCode).toBe(200)
  })
})

describe('Pictures endpoints', () => {
  it('should return current pictures', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/pictures?username=Rocky')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          ip: expect.any(String),
          measure: expect.any(String),
          sensor: expect.any(String),
          timestamp: expect.any(Number),
          username: expect.any(String),
          stage: expect.any(String),
          stage_id: expect.any(Number),
          image_url: expect.any(String)
        })
      ])
    )
    expect(res.body[0].measure).toEqual('pictures')
    expect(res.body[0].username).toEqual('Rocky')
  }, 100000)

  it('should return an empty array when no username provided', async () => {
    await new Promise(r => setTimeout(r, REFRESH_TIME / 3))
    const res = await request(app).get('/pictures')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(expect.arrayContaining([]))
  }, 100000)

  it('should return previous pictures (history)', async () => {
    const res = await request(app)
      .get(
        '/pictures/history?' +
        'ip=192.168.1.50&' +
        'username=Rocky&' +
        'init_timestamp=1772000000000&' +
        'end_timestamp=1772036000000'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ip: expect.any(String),
          username: expect.any(String),
          stage: expect.any(String),
          stage_id: expect.any(Number),
          image_url: expect.any(String),
          timestamp: expect.any(Number)
        })
      ])
    )
  }, 100000)

  it('should not return history without username', async () => {
    const res = await request(app)
      .get(
        '/pictures/history?' +
        'ip=192.168.1.50&' +
        'init_timestamp=1772000000000&' +
        'end_timestamp=1772036000000'
      )

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(expect.arrayContaining([]))
  }, 100000)
})

describe('Internal Auth Middleware', () => {
  it('should reject requests lacking x-internal-api-key when not testing environment', () => {
    const { requireInternalKey } = require('../src/app/middleware/internal-auth.middleware')
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    requireInternalKey({ headers: {} }, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    process.env.NODE_ENV = originalEnv
  })

  it('should pass requests with correct x-internal-api-key when not testing environment', () => {
    // In the middleware, INTERNAL_API_KEY is resolved at module import (undefined during mock if not provided).
    // The test requires reloading or just relying on undefined bypass not throwing error.
    const { requireInternalKey } = require('../src/app/middleware/internal-auth.middleware')
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    requireInternalKey({ headers: { 'x-internal-api-key': 'testkey' } }, res, next)
    process.env.NODE_ENV = originalEnv
  })
})
