const request = require('supertest');
const app = require('../src/app/app');
const { isValidMicrocontroller } = require('../src/helpers/helpers');
const Dao = require('../src/database/dao');

jest.mock('../src/database/dao');

describe('Microcontrollers MS - Extra Coverage', () => {
    it('GET /health should return 200', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('GET /metrics should return 200', async () => {
        const res = await request(app).get('/metrics');
        expect(res.statusCode).toBe(200);
    });

    it('getMicrocontrollersFromMS should not cache if response is empty (Line 29)', async () => {
        Dao.prototype.findByMeasure.mockResolvedValueOnce([]);
        const res = await request(app).get('/non-existent-measure').set('x-internal-api-key', process.env.INTERNAL_API_KEY || 'testkey');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('isValidMicrocontroller should handle missing argument (Line 8)', () => {
        expect(isValidMicrocontroller()).toBe(false);
    });

    it('postMicrocontrollers should handle database error (Line 45)', async () => {
        Dao.prototype.insertMicrocontroller.mockRejectedValueOnce(new Error('DB Error'));
        const res = await request(app)
            .post('/')
            .send({ ip: '1.1.1.1', measure: 'temp', sensor: 's', username: 'u' })
            .set('x-internal-api-key', process.env.INTERNAL_API_KEY || 'testkey');
        expect(res.statusCode).toBe(400);
    });

    it('putMicrocontrollers should handle database error (Line 66)', async () => {
        Dao.prototype.updateMicrocontroller.mockRejectedValueOnce(new Error('DB Error'));
        const res = await request(app)
            .put('/')
            .send({ ip: '1.1.1.1', measure: 'temp', sensor: 's', username: 'u', old_ip: '2.2.2.2' })
            .set('x-internal-api-key', process.env.INTERNAL_API_KEY || 'testkey');
        expect(res.statusCode).toBe(400);
    });

    it('deleteMicrocontrollers should handle database error (Line 80)', async () => {
        Dao.prototype.deleteMicrocontroller.mockRejectedValueOnce(new Error('DB Error'));
        const res = await request(app)
            .delete('/')
            .send({ ip: '1.1.1.1', measure: 'temp', sensor: 's', username: 'u' })
            .set('x-internal-api-key', process.env.INTERNAL_API_KEY || 'testkey');
        expect(res.statusCode).toBe(400);
    });
});
