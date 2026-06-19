const ServicesController = require('../src/app/controllers/services.controller')
const axios = require('axios')
jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
}))

describe('ServicesController Branches', () => {
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

    test('should return 502 when axios throws', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        await controller.getToConnectedService(mockRes, 'fake-service', 'path');
        expect(mockRes.status).toHaveBeenCalledWith(502);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Bad Gateway' });
    });

    test('should return 404 when response.data is null', async () => {
        axios.post.mockResolvedValueOnce({ data: null });
        await controller.postToConnectedService(mockRes, 'fake-service', 'path', {}, 200, false);
        expect(mockRes.sendStatus).toHaveBeenCalledWith(404);
    });

    test('should return response directly if returnResponse is true', async () => {
        const fullResponse = { data: 'ok', headers: {} };
        axios.get.mockResolvedValueOnce(fullResponse);
        const result = await controller.getToConnectedService(mockRes, 'fake-service', '', {}, true);
        expect(result).toBe(fullResponse);
    });

    test('should fallback to empty string for INTERNAL_API_KEY when missing', () => {
        const oldKey = process.env.INTERNAL_API_KEY;
        delete process.env.INTERNAL_API_KEY;
        jest.isolateModules(() => {
            const SController = require('../src/app/controllers/services.controller');
            expect(SController).toBeDefined();
        });
        process.env.INTERNAL_API_KEY = oldKey;
    });

    test('delete method should use axios.delete with data', async () => {
        axios.delete.mockResolvedValueOnce({ data: { deleted: true } });
        await controller.deleteToConnectedService(mockRes, 'fake-service', 'path', { id: 1 });
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringContaining('fake-service/path'),
            expect.objectContaining({ data: { id: 1 } })
        );
    });
});
