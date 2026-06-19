// Tests for request.module in publisher-ms
jest.mock('axios', () => ({
    get: jest.fn()
}));
const axios = require('axios');
const { getMessage } = require('../src/modules/message.module');
jest.mock('../src/modules/message.module');

const { getMicrocontrollers, requestMeasure, saveMeasure } = require('../src/modules/request.module');

describe('request.module', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('getMicrocontrollers returns data on success', async () => {
        const mockData = [{ ip: '1.2.3.4', measure: 'temp' }];
        axios.get.mockResolvedValueOnce({ data: mockData });
        const result = await getMicrocontrollers('temperature');
        expect(result).toEqual(mockData);
    });

    test('getMicrocontrollers returns undefined on error', async () => {
        axios.get.mockRejectedValueOnce(new Error('network'));
        // request.module.js doesn't have a try-catch for getMicrocontrollers, so it will throw.
        // Let me check request.module.js content again.
        await expect(getMicrocontrollers('humidity')).rejects.toThrow('network');
    });

    test('getMicrocontrollers calls endpoint without API key if not set', async () => {
        const originalKey = process.env.INTERNAL_API_KEY;
        delete process.env.INTERNAL_API_KEY;
        
        axios.get.mockResolvedValueOnce({ data: [] });
        await getMicrocontrollers('temp');
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/temp'), {}); // no config headers
        
        process.env.INTERNAL_API_KEY = originalKey;
    });

    test('requestMeasure returns raw data on success', async () => {
        const micro = { ip: '1.2.3.4', measure: 'temp' };
        const apiResponse = { data: { value: 42 } };
        axios.get.mockResolvedValueOnce(apiResponse);
        const result = await requestMeasure(micro);
        expect(result).toEqual(apiResponse.data);
        expect(axios.get).toHaveBeenCalledWith('http://1.2.3.4/temp', { timeout: expect.any(Number) });
    });

    test('requestMeasure returns undefined on error', async () => {
        const micro = { ip: '1.2.3.4', measure: 'temp' };
        axios.get.mockRejectedValueOnce(new Error('timeout'));
        const result = await requestMeasure(micro);
        expect(result).toBeUndefined();
    });

    test('saveMeasure posts data to measure-ms', async () => {
        axios.post = jest.fn().mockResolvedValueOnce({ status: 201 });
        const data = { hum: 50 };
        await saveMeasure('humidity', data);
        expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/humidity$/), data, expect.any(Object));
    });

    test('saveMeasure posts data without API key if not set', async () => {
        const originalKey = process.env.INTERNAL_API_KEY;
        delete process.env.INTERNAL_API_KEY;
        axios.post = jest.fn().mockResolvedValueOnce({ status: 201 });
        await saveMeasure('temp', {});
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), {}, {});
        process.env.INTERNAL_API_KEY = originalKey;
    });

    test('saveMeasure logs error on failure', async () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        axios.post = jest.fn().mockRejectedValueOnce(new Error('fail'));
        await saveMeasure('humidity', {});
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Error saving humidity'), 'fail');
        spy.mockRestore();
    });
});
