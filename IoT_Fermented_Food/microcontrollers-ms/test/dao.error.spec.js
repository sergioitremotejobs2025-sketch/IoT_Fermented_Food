// DAO error handling tests to increase branch coverage
const Dao = require('../src/database/dao');

// Mock mysql to always return an error on query
jest.mock('mysql', () => {
    return {
        createConnection: () => {
            return {
                connect: cb => { if (cb) cb(null); },
                on: () => { },
                query: (query, values, cb) => {
                    // Simulate a generic DB error for any query
                    cb(new Error('DB_ERROR'));
                }
            };
        }
    };
});

describe('Dao error branches', () => {
    let dao;
    beforeEach(() => {
        dao = new Dao();
    });

    test('findByMeasure propagates error', async () => {
        await expect(dao.findByMeasure('temperature')).rejects.toThrow('DB_ERROR');
    });

    test('findByUsername propagates error', async () => {
        await expect(dao.findByUsername('Rocky')).rejects.toThrow('DB_ERROR');
    });

    test('insertMicrocontroller propagates error', async () => {
        await expect(
            dao.insertMicrocontroller({ ip: '1.2.3.4', measure: 'temperature', sensor: 's', username: 'u' })
        ).rejects.toThrow('DB_ERROR');
    });

    test('updateMicrocontroller propagates error', async () => {
        await expect(
            dao.updateMicrocontroller({ ip: '1.2.3.5', measure: 'temperature', old_ip: '1.2.3.4', sensor: 's', username: 'u' })
        ).rejects.toThrow('DB_ERROR');
    });

    test('deleteMicrocontroller propagates error', async () => {
        await expect(dao.deleteMicrocontroller({ ip: '1.2.3.4', measure: 'temperature' })).rejects.toThrow('DB_ERROR');
    });
});
