const ServicesController = require('../src/app/controllers/services.controller')
const axios = require('axios')
jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
}))

describe('ServicesController Extra Branches', () => {
    let controller;
    let mockRes;

    beforeEach(() => {
        controller = new ServicesController();
        mockRes = {
            sendStatus: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should return status from error.response if present', async () => {
        const error = new Error('Client Error');
        error.response = {
            status: 418,
            data: { message: "I'm a teapot" }
        };
        axios.get.mockRejectedValueOnce(error);

        await controller.getToConnectedService(mockRes, 'fake-service', 'path');

        expect(mockRes.status).toHaveBeenCalledWith(418);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "I'm a teapot" });
    });

    test('should use AI_TRAIN_TIMEOUT for AI train calls', async () => {
        const { AI_MS, AI_TRAIN_TIMEOUT } = require('../src/config/services.config');

        axios.post.mockResolvedValueOnce({ data: { ok: true } });

        await controller.postToConnectedService(mockRes, AI_MS, 'train', { some: 'data' }, 200, false);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/train'),
            expect.any(Object),
            expect.objectContaining({ timeout: AI_TRAIN_TIMEOUT })
        );
    });

    test('putToConnectedService should call axios.put and handle default returnResponse=false', async () => {
        axios.put.mockResolvedValueOnce({ data: { success: true } });
        await controller.putToConnectedService(mockRes, 'fake-service', 'path', { foo: 'bar' }, 204);
        expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('fake-service/path'),
            { foo: 'bar' },
            expect.any(Object)
        );
        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    test('methodToConnectedService should use default parameters', async () => {
        axios.post.mockResolvedValueOnce({ data: { ok: true } });

        await controller.postToConnectedService(mockRes, 'some-service', undefined, undefined, undefined, undefined);

        expect(axios.post).toHaveBeenCalledWith(
            'http://some-service/',
            {}, // default body={}
            expect.objectContaining({ timeout: 10000 })
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('buildHeaders branch coverage', async () => {
        axios.get.mockResolvedValueOnce({ data: { ok: true } });
        await controller.getToConnectedService(mockRes, 'other-service');
        expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ headers: {} }));

        const oldKey = process.env.INTERNAL_API_KEY;
        delete process.env.INTERNAL_API_KEY;

        jest.isolateModules(async () => {
            const SController = require('../src/app/controllers/services.controller');
            const ax = require('axios');
            jest.mock('axios', () => ({ get: jest.fn().mockResolvedValue({ data: { ok: true } }) }));
            const c = new SController();
            const { MEASURE_MS } = require('../src/config/services.config');
            await c.getToConnectedService(mockRes, MEASURE_MS);
            expect(ax.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ headers: {} }));
        });

        process.env.INTERNAL_API_KEY = oldKey;
    });
});
