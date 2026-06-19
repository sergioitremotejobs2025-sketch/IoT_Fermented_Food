// Controller unit tests for microcontrollers-ms to increase branch coverage
const OrchestratorController = require('../src/app/controllers/microcontrollers.controller')
const Dao = require('../src/database/dao')
const helpers = require('../src/helpers/helpers')

jest.mock('../src/database/dao')
jest.mock('../src/helpers/helpers')

// Mock NodeCache used inside controller
jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => {
        const store = {}
        return {
            get: jest.fn(key => store[key]),
            set: jest.fn((key, val) => { store[key] = val }),
            del: jest.fn(keys => {
                if (Array.isArray(keys)) {
                    keys.forEach(k => delete store[k])
                } else {
                    delete store[keys]
                }
            })
        }
    })
})

const createRes = () => {
    const res = {}
    res.status = jest.fn(code => {
        res._status = code
        return res
    })
    res.json = jest.fn(data => {
        res._json = data
        return res
    })
    res.sendStatus = jest.fn(code => {
        res._status = code
        return res
    })
    return res
}

describe('OrchestratorController', () => {
    let controller
    beforeEach(() => {
        // reset mocks
        Dao.mockClear()
        helpers.isValidMicrocontroller.mockClear()
        controller = new OrchestratorController()
    })

    test('getMicrocontrollers cache miss then hit', async () => {
        const req = { query: { username: 'Rocky' } }
        const res = createRes()
        // first call: dao returns array
        Dao.prototype.findByUsername.mockResolvedValueOnce([{ username: 'Rocky' }])
        await controller.getMicrocontrollers(req, res)
        expect(res._status).toBe(200)
        expect(res._json).toEqual([{ username: 'Rocky' }])
        // second call should hit cache, dao not called again
        Dao.prototype.findByUsername.mockClear()
        const res2 = createRes()
        await controller.getMicrocontrollers(req, res2)
        expect(res2._status).toBe(200)
        expect(res2._json).toEqual([{ username: 'Rocky' }])
        expect(Dao.prototype.findByUsername).not.toHaveBeenCalled()
    })

    test('getMicrocontrollersFromMS cache miss', async () => {
        const req = { params: { measure: 'temperature' } }
        const res = createRes()
        Dao.prototype.findByMeasure.mockResolvedValueOnce([{ measure: 'temperature' }])
        await controller.getMicrocontrollersFromMS(req, res)
        expect(res._status).toBe(200)
        expect(res._json).toEqual([{ measure: 'temperature' }])
    })

    test('postMicrocontrollers success and duplicate handling', async () => {
        const valid = { ip: '1.2.3.4', measure: 'temperature', sensor: 's', username: 'Rocky' }
        const req = { body: valid }
        const res = createRes()
        helpers.isValidMicrocontroller.mockReturnValue(true)
        Dao.prototype.insertMicrocontroller.mockResolvedValueOnce(true)
        await controller.postMicrocontrollers(req, res)
        expect(res._status).toBe(201)
        expect(res._json).toEqual(valid)
        // duplicate case returns false -> 204
        const dupRes = createRes()
        Dao.prototype.insertMicrocontroller.mockResolvedValueOnce(false)
        await controller.postMicrocontrollers(req, dupRes)
        expect(dupRes._status).toBe(204)
    })

    test('postMicrocontrollers invalid payload and error', async () => {
        const req = { body: {} }
        const res = createRes()
        helpers.isValidMicrocontroller.mockReturnValue(false)
        await controller.postMicrocontrollers(req, res)
        expect(res._status).toBe(400)
        // simulate dao error
        const errReq = { body: { ip: 'x', measure: 'y', sensor: 'z', username: 'u' } }
        const errRes = createRes()
        helpers.isValidMicrocontroller.mockReturnValue(true)
        Dao.prototype.insertMicrocontroller.mockRejectedValueOnce(new Error('db'))
        await controller.postMicrocontrollers(errReq, errRes)
        expect(errRes._status).toBe(400)
    })

    test('putMicrocontrollers success, not found, and error', async () => {
        const body = { ip: '1.2.3.5', measure: 'temperature', sensor: 's', username: 'Rocky', old_ip: '1.2.3.4' }
        const req = { body }
        const res = createRes()
        helpers.isValidMicrocontroller.mockReturnValue(true)
        Dao.prototype.updateMicrocontroller.mockResolvedValueOnce(true)
        await controller.putMicrocontrollers(req, res)
        expect(res._status).toBe(201)
        expect(res._json).toEqual({ ip: '1.2.3.5', measure: 'temperature', sensor: 's', username: 'Rocky' })
        // not found (false)
        const notRes = createRes()
        const req2 = { body: { ...body, old_ip: '1.2.3.4' } }
        Dao.prototype.updateMicrocontroller.mockResolvedValueOnce(false)
        await controller.putMicrocontrollers(req2, notRes)
        expect(notRes._status).toBe(404)
        // error case
        const errRes = createRes()
        const req3 = { body: { ...body, old_ip: '1.2.3.4' } }
        Dao.prototype.updateMicrocontroller.mockRejectedValueOnce(new Error('db'))
        await controller.putMicrocontrollers(req3, errRes)
        expect(errRes._status).toBe(400)
    })

    test('deleteMicrocontrollers success, not found, error', async () => {
        const body = { ip: '1.2.3.4', measure: 'temperature' }
        const req = { body }
        const res = createRes()
        Dao.prototype.deleteMicrocontroller.mockResolvedValueOnce(true)
        await controller.deleteMicrocontrollers(req, res)
        expect(res._status).toBe(200)
        // not found
        const notRes = createRes()
        Dao.prototype.deleteMicrocontroller.mockResolvedValueOnce(false)
        await controller.deleteMicrocontrollers(req, notRes)
        expect(notRes._status).toBe(404)
        // error
        const errRes = createRes()
        Dao.prototype.deleteMicrocontroller.mockRejectedValueOnce(new Error('db'))
        await controller.deleteMicrocontrollers(req, errRes)
        expect(errRes._status).toBe(400)
    })
})
