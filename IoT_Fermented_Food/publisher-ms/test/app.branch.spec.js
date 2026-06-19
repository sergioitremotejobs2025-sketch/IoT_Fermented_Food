// Branch coverage tests for publisher app (publishMeasure & main)
jest.mock('../src/config/config', () => ({
    PING_TIMEOUT: 10,
    QUEUES_MEASURES: {
        humidity: 'h',
        light: 'l',
        temperature: 't'
    }
}));

// Mock modules before requiring app
jest.mock('../src/modules/request.module', () => ({
    getMicrocontrollers: jest.fn(),
    requestMeasure: jest.fn(),
    saveMeasure: jest.fn()
}));

const mockTransformed = { payload: 'msg' };
jest.mock('../src/modules/message.module', () => ({
    getMessage: jest.fn().mockImplementation(() => mockTransformed)
}));

const mockPublish = jest.fn();
jest.mock('../src/modules/queue.module', () => {
    return jest.fn().mockImplementation(() => ({
        isReady: jest.fn().mockResolvedValue(),
        publish: mockPublish,
        close: jest.fn()
    }));
});

const { main } = require('../src/app/app');
const { getMicrocontrollers, requestMeasure, saveMeasure } = require('../src/modules/request.module');
const { getMessage } = require('../src/modules/message.module');
const QueueModule = require('../src/modules/queue.module');

describe('publisher app branch coverage', () => {
    const measures = ['humidity', 'light', 'temperature'];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('main publishes when requestMeasure returns a response (truthy branch)', async () => {
        getMicrocontrollers.mockImplementation(measure => Promise.resolve([
            { ip: '1.2.3.4', measure }
        ]));
        requestMeasure.mockResolvedValue({ payload: 'msg' });

        await main();

        measures.forEach(m => expect(getMicrocontrollers).toHaveBeenCalledWith(m));
        expect(requestMeasure).toHaveBeenCalledTimes(measures.length);
        expect(saveMeasure).toHaveBeenCalledTimes(measures.length);
        expect(getMessage).toHaveBeenCalledTimes(measures.length);
        expect(QueueModule).toHaveBeenCalledTimes(measures.length);
        expect(mockPublish).toHaveBeenCalledWith(mockTransformed);
    });

    test('main skips publishing when requestMeasure returns undefined (falsy branch)', async () => {
        getMicrocontrollers.mockImplementation(measure => {
            if (measure === 'humidity') return Promise.resolve([{ ip: '5.6.7.8', measure: 'humidity' }]);
            return Promise.resolve([]);
        });
        requestMeasure.mockResolvedValue(undefined);

        await main();

        // mockPublish should not have been called for humidity
        expect(mockPublish).not.toHaveBeenCalled();
    });

    test('publishMeasure handles errors and logs them (Line 27)', async () => {
        getMicrocontrollers.mockRejectedValue(new Error('critical failure'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await main();

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('error:'), 'critical failure');
        consoleErrorSpy.mockRestore();
    });
});
