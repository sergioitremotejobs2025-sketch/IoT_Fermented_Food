const axios = require('axios');
const MicrocontrollersModule = require('../src/modules/microcontrollers.module');
const MeasureController = require('../src/app/controllers/measure.controller');
const MeasureModel = require('../src/app/models/measure.model');
const Dao = require('../src/database/dao');

describe('Measure-MS 100% Coverage Final Push', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('MeasureController: requestMeasure catch block (Line 28)', async () => {
        const controller = new MeasureController('temperature');
        const spy = jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network Error'));
        const result = await controller.requestMeasure({ ip: '1.2.3.4', measure: 'temperature' });
        expect(result).toBeUndefined();
        spy.mockRestore();
    });

    test('MeasureController: getMeasure catch block (Line 23)', async () => {
        const controller = new MeasureController('temperature');
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        jest.spyOn(controller.microsModule, 'getMicrocontrollers').mockRejectedValueOnce(new Error('Module Error'));
        await controller.getMeasure({ query: { username: 'test' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Module Error');
    });

    test('MeasureController: postLight branches (Lines 47-57)', async () => {
        const controller = new MeasureController('light');
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        const controllerNotLight = new MeasureController('temperature');
        await controllerNotLight.postLight({}, res);
        expect(res.status).toHaveBeenCalledWith(400);

        jest.spyOn(controller.microsModule, 'getMicrocontrollers').mockResolvedValueOnce([]);
        await controller.postLight({ body: { ip: '1.2.3.4', username: 'u', status: 'on' } }, res);
        expect(res.status).toHaveBeenCalledWith(404);

        jest.spyOn(controller.microsModule, 'getMicrocontrollers').mockResolvedValue([{ ip: '1.2.3.4', username: 'u', measure: 'light' }]);
        const spyPost = jest.spyOn(axios, 'post');

        spyPost.mockRejectedValueOnce(new Error('Invalid measurement: test'));
        await controller.postLight({ body: { ip: '1.2.3.4', username: 'u', status: 'on' } }, res);
        expect(res.status).toHaveBeenCalledWith(422);

        spyPost.mockRejectedValueOnce(new Error('Generic Error'));
        await controller.postLight({ body: { ip: '1.2.3.4', username: 'u', status: 'on' } }, res);
        expect(res.status).toHaveBeenCalledWith(400);

        spyPost.mockRestore();
    });

    test('MeasureController: postMeasure branches (Lines 68-79)', async () => {
        const controller = new MeasureController('temperature');
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        jest.spyOn(controller.microsModule, 'getMicrocontrollers').mockResolvedValueOnce([]);
        await controller.postMeasure({ body: { username: 'missing', ip: '0.0.0.0' } }, res);
        expect(res.status).toHaveBeenCalledWith(404);

        jest.spyOn(controller.microsModule, 'getMicrocontrollers').mockResolvedValue([{ username: 'u', ip: 'i', measure: 'temperature' }]);

        jest.spyOn(controller.measureModel, 'saveMeasure').mockRejectedValueOnce(new Error('Invalid measurement: test'));
        await controller.postMeasure({ body: { username: 'u', ip: 'i', temperature: 25 } }, res);
        expect(res.status).toHaveBeenCalledWith(422);

        jest.spyOn(controller.measureModel, 'saveMeasure').mockRejectedValueOnce(new Error('Generic'));
        await controller.postMeasure({ body: { username: 'u', ip: 'i', temperature: 25 } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('MeasureModel: validate missing value (Line 20)', () => {
        const model = new MeasureModel('temperature');
        expect(() => model.validate({}, { measure: 'temperature' })).toThrow('Missing measurement value');
        expect(() => model.validate({ temperature: null }, { measure: 'temperature' })).toThrow('Missing measurement value');
    });

    test('MeasureModel: bounds and pictures (Line 32, 56)', () => {
        const modelL = new MeasureModel('light');
        expect(() => modelL.validate({ light: 2000 }, { measure: 'light' })).toThrow();

        const modelP = new MeasureModel('pictures');
        const msg = modelP.getMessage({ pictures: 'data', extra: 'field' }, { measure: 'pictures', ip: 'i', username: 'u', sensor: 's' });
        expect(msg.extra).toBe('field');
    });

    test('MeasureModel: findMeasures date branches (Line 75)', async () => {
        const model = new MeasureModel('temperature');
        jest.spyOn(Dao.prototype, 'findTemperature').mockResolvedValue([]);
        await model.findMeasures({ username: 'u', ip: 'i', end_date: '2020-01-01' });
    });

    test('Internal Auth: Middleware Success Path (NODE_ENV=production)', () => {
        const oldEnv = process.env.NODE_ENV;
        const oldKey = process.env.INTERNAL_API_KEY;
        process.env.NODE_ENV = 'production';
        process.env.INTERNAL_API_KEY = 'secret';

        jest.isolateModules(() => {
            const { requireInternalKey } = require('../src/app/middleware/internal-auth.middleware');
            const next = jest.fn();
            requireInternalKey({ headers: { 'x-internal-api-key': 'secret' } }, {}, next);
            expect(next).toHaveBeenCalled();
        });

        process.env.NODE_ENV = oldEnv;
        process.env.INTERNAL_API_KEY = oldKey;
    });

    test('Internal Auth: Middleware Unauthorized Path (NODE_ENV=production)', () => {
        const oldEnv = process.env.NODE_ENV;
        const oldKey = process.env.INTERNAL_API_KEY;
        process.env.NODE_ENV = 'production';
        process.env.INTERNAL_API_KEY = 'secret';

        jest.isolateModules(() => {
            const { requireInternalKey } = require('../src/app/middleware/internal-auth.middleware');
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            requireInternalKey({ headers: { 'x-internal-api-key': 'wrong' } }, res, jest.fn());
            expect(res.status).toHaveBeenCalledWith(401);
        });

        process.env.NODE_ENV = oldEnv;
        process.env.INTERNAL_API_KEY = oldKey;
    });

    test('Internal Auth: Middleware Warning Case', () => {
        const oldEnv = process.env.NODE_ENV;
        const oldKey = process.env.INTERNAL_API_KEY;
        process.env.NODE_ENV = 'production';
        delete process.env.INTERNAL_API_KEY;

        jest.isolateModules(() => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
            require('../src/app/middleware/internal-auth.middleware');
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        process.env.NODE_ENV = oldEnv;
        process.env.INTERNAL_API_KEY = oldKey;
    });

    test('App: Full Startup and Metric Check', async () => {
        const oldEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        process.env.INTERNAL_API_KEY = 'k';

        jest.mock('../src/database/dao');
        jest.mock('../src/app/schedulers/picture.scheduler', () => {
            return jest.fn().mockImplementation(() => ({ start: jest.fn() }));
        });

        const request = require('supertest');
        let appProd;
        jest.isolateModules(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => { });
            appProd = require('../src/app/app');
        });

        // Hit routes on the production app instance to get function coverage
        await request(appProd).get('/health');
        await request(appProd).get('/metrics');

        process.env.NODE_ENV = oldEnv;
    });
});
