// DAO unit tests to increase branch coverage
const Mysql = require('../src/database/dao')

jest.mock('mysql', () => {
    return {
        createConnection: jest.fn(() => {
            return {
                connect: jest.fn(cb => cb && cb(null)),
                on: jest.fn((event, handler) => {
                    // simulate no error by default
                }),
                query: jest.fn((q, v, cb) => {
                    if (typeof v === 'function') {
                        cb = v;
                        v = [];
                    }
                    if (q.includes('SELECT')) {
                        cb(null, [{ measure: 'temperature', username: 'Rocky' }])
                    } else if (q.includes('INSERT')) {
                        if (v && v[0] === '192.168.1.350') return cb(new Error('dup'))
                        cb(null, { affectedRows: 1 })
                    } else if (q.includes('UPDATE')) {
                        if (v && v[0] === '192.168.1.350') return cb(new Error('err'))
                        cb(null, { affectedRows: 1 })
                    } else if (q.includes('DELETE')) {
                        cb(null, { affectedRows: 1 })
                    } else {
                        cb(null, [])
                    }
                })
            }
        })
    }
})

describe('Mysql DAO', () => {
    let dao
    beforeEach(() => {
        dao = new Mysql()
    })

    test('query without values trigger branch', async () => {
        const res = await dao.query('SELECT 1');
        expect(res).toBeDefined();
    })

    test('findByMeasure returns filtered microcontrollers', async () => {
        const result = await dao.findByMeasure('temperature')
        expect(Array.isArray(result)).toBe(true)
        result.forEach(m => expect(m.measure).toBe('temperature'))
    })

    test('findByUsername returns filtered microcontrollers', async () => {
        const result = await dao.findByUsername('Rocky')
        expect(Array.isArray(result)).toBe(true)
        result.forEach(m => expect(m.username).toBe('Rocky'))
    })

    test('findByGateway returns filtered microcontrollers', async () => {
        const result = await dao.findByGateway('FOG_NODE_01')
        expect(Array.isArray(result)).toBe(true)
    })

    test('pairMicrocontroller returns true on success', async () => {
        const ok = await dao.pairMicrocontroller('1.2.3.4', 'temp', 'gateway-1')
        expect(ok).toBe(true)
    })

    test('insertMicrocontroller returns true on new entry', async () => {
        const ok = await dao.insertMicrocontroller({ ip: '1.2.3.4', measure: 'temperature', sensor: 's', username: 'u' })
        expect(ok).toBe(true)
    })

    test('insertMicrocontroller with gatewayId returns true', async () => {
        const ok = await dao.insertMicrocontroller({ 
            ip: '1.2.3.4', 
            measure: 'temp', 
            sensor: 's', 
            username: 'u',
            gateway_id: 'fog-1'
        })
        expect(ok).toBe(true)
    })

    test('insertMicrocontroller returns false on duplicate', async () => {
        // duplicate IP triggers error in mock, should be caught and return false
        await expect(dao.insertMicrocontroller({ ip: '192.168.1.350', measure: 'temperature', sensor: 's', username: 'u' })).rejects.toThrow()
    })

    test('updateMicrocontroller returns true when existing', async () => {
        const ok = await dao.updateMicrocontroller({ ip: '1.2.3.5', measure: 'temperature', old_ip: '192.168.1.222', sensor: 's', username: 'u', thresholdMin: null, thresholdMax: null })
        expect(ok).toBe(true)
    })

    test('updateMicrocontroller with gatewayId returns true', async () => {
        const ok = await dao.updateMicrocontroller({ 
            ip: '1.2.3.5', 
            measure: 'temp', 
            old_ip: '1.2.3.4', 
            sensor: 's', 
            username: 'u', 
            gateway_id: 'fog-1' 
        })
        expect(ok).toBe(true)
    })

    test('updateMicrocontroller throws on bad update', async () => {
        await expect(dao.updateMicrocontroller({ ip: '192.168.1.350', measure: 'temperature', old_ip: '192.168.1.222', sensor: 's', username: 'u', thresholdMin: null, thresholdMax: null })).rejects.toThrow()
    })

    test('deleteMicrocontroller returns true when exists', async () => {
        const ok = await dao.deleteMicrocontroller({ ip: '192.168.1.222', measure: 'temperature' })
        expect(ok).toBe(true)
    })
})
