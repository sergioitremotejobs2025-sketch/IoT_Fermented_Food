const OrchestratorController = require('../src/app/controllers/microcontrollers.controller')
const Dao = require('../src/database/dao')
const helpers = require('../src/helpers/helpers')

jest.mock('../src/database/dao')
jest.mock('../src/helpers/helpers')

// Mock NodeCache
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

describe('OrchestratorController V2 (Discovery & Pairing)', () => {
    let controller
    beforeEach(() => {
        Dao.mockClear()
        helpers.isValidMicrocontroller.mockClear()
        controller = new OrchestratorController()
    })

    test('getMicrocontrollers by gateway_id (Discovery) - cache hit', async () => {
        const req = { query: { gateway_id: 'FOG_NODE_01' } }
        const res = createRes()
        const mockData = [{ ip: '1.2.3.50', gateway_id: 'FOG_NODE_01' }]
        
        // Miss then Hit
        Dao.prototype.findByGateway.mockResolvedValueOnce(mockData)
        await controller.getMicrocontrollers(req, res)
        expect(res._json).toEqual(mockData)
        
        const res2 = createRes()
        await controller.getMicrocontrollers(req, res2)
        expect(res2._json).toEqual(mockData)
        expect(Dao.prototype.findByGateway).toHaveBeenCalledTimes(1)
    })

    test('getMicrocontrollers by gateway_id (empty results)', async () => {
        const req = { query: { gateway_id: 'UNKNOWN_SITE' } }
        const res = createRes()
        Dao.prototype.findByGateway.mockResolvedValueOnce([])
        
        await controller.getMicrocontrollers(req, res)
        
        expect(res._status).toBe(200)
        expect(res._json).toEqual([])
        expect(Dao.prototype.findByGateway).toHaveBeenCalled()
    })

    test('getMicrocontrollers by username (empty results)', async () => {
        const req = { query: { username: 'Nobody' } }
        const res = createRes()
        Dao.prototype.findByUsername.mockResolvedValueOnce([])
        
        await controller.getMicrocontrollers(req, res)
        
        expect(res._status).toBe(200)
        expect(res._json).toEqual([])
    })

    test('pairMicrocontroller success', async () => {
        const req = { body: { ip: '192.168.1.50', measure: 'temperature', gateway_id: 'FOG_NODE_01' } }
        const res = createRes()
        Dao.prototype.pairMicrocontroller.mockResolvedValueOnce(true)
        
        await controller.pairMicrocontroller(req, res)
        
        expect(res._status).toBe(200)
        expect(res._json.status).toBe('paired')
    })

    test('pairMicrocontroller 400 on missing payload', async () => {
        const req = { body: { ip: '192.168.1.50' } }
        const res = createRes()
        await controller.pairMicrocontroller(req, res)
        expect(res._status).toBe(400)
    })

    test('pairMicrocontroller 404 on non-existent device', async () => {
        const req = { body: { ip: '9.9.9.9', measure: 'unknown', gateway_id: 'FOG_NODE_01' } }
        const res = createRes()
        Dao.prototype.pairMicrocontroller.mockResolvedValueOnce(false)
        await controller.pairMicrocontroller(req, res)
        expect(res._status).toBe(404)
    })

    test('pairMicrocontroller 500 on database error', async () => {
        const req = { body: { ip: '1.1.1.1', measure: 'temp', gateway_id: 'fog-1' } }
        const res = createRes()
        Dao.prototype.pairMicrocontroller.mockRejectedValueOnce(new Error('DB_DOWN'))
        await controller.pairMicrocontroller(req, res)
        expect(res._status).toBe(500)
    })
})
