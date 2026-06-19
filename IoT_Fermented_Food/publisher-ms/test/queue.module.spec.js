// Robust tests for queue.module in publisher-ms
const amqp = require('amqplib');
jest.mock('amqplib');

// Mock config values
jest.mock('../src/config/config', () => ({
    PASSWORD: 'pass',
    RABBITMQ: 'localhost',
    USERNAME: 'user'
}));

const Queue = require('../src/modules/queue.module');

describe('Queue module', () => {
    let mockChannel, mockConnection;

    beforeEach(() => {
        jest.clearAllMocks();
        mockChannel = {
            sendToQueue: jest.fn((q, content, opts, cb) => cb(null, true)),
            assertQueue: jest.fn().mockResolvedValue({}),
            assertExchange: jest.fn().mockResolvedValue({}),
            bindQueue: jest.fn().mockResolvedValue({}),
            on: jest.fn(),
            close: jest.fn().mockResolvedValue({})
        };
        mockConnection = {
            createConfirmChannel: jest.fn().mockResolvedValue(mockChannel),
            on: jest.fn(),
            close: jest.fn().mockResolvedValue({})
        };
        amqp.connect.mockResolvedValue(mockConnection);
    });

    test('connect establishes connection and channel', async () => {
        const q = new Queue('testQueue');
        await q.isReady();

        expect(amqp.connect).toHaveBeenCalled();
        expect(mockConnection.createConfirmChannel).toHaveBeenCalled();
        expect(mockChannel.assertExchange).toHaveBeenCalledWith('dlx', 'fanout', { durable: true });
        expect(mockChannel.assertQueue).toHaveBeenCalledWith('testQueue', {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'dlx'
            }
        });
    });

    test('handles connection error and close', async () => {
        const q = new Queue('testQueue');
        await q.isReady();

        const errorCalls = mockConnection.on.mock.calls.filter(call => call[0] === 'error');
        const closeCalls = mockConnection.on.mock.calls.filter(call => call[0] === 'close');

        expect(errorCalls.length).toBeGreaterThan(0);
        expect(closeCalls.length).toBeGreaterThan(0);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const reconnectSpy = jest.spyOn(q, 'reconnect').mockImplementation(() => Promise.resolve());

        // Trigger error
        errorCalls[0][1](new Error('connection fail'));
        expect(consoleErrorSpy).toHaveBeenCalledWith('[AMQP] connection error', 'connection fail');

        // Trigger close
        closeCalls[0][1]();
        expect(consoleErrorSpy).toHaveBeenCalledWith('[AMQP] connection closed, reconnecting...');
        expect(reconnectSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        reconnectSpy.mockRestore();
    });

    test('handles channel error and close', async () => {
        const q = new Queue('testQueue');
        await q.isReady();

        const errorCalls = mockChannel.on.mock.calls.filter(call => call[0] === 'error');
        const closeCalls = mockChannel.on.mock.calls.filter(call => call[0] === 'close');

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(errorCalls.length).toBeGreaterThan(0);
        errorCalls[0][1](new Error('channel fail'));
        expect(consoleErrorSpy).toHaveBeenCalledWith('[AMQP] channel error', 'channel fail');

        expect(closeCalls.length).toBeGreaterThan(0);
        closeCalls[0][1]();
        expect(consoleLogSpy).toHaveBeenCalledWith('[AMQP] channel closed');

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('publish sends message when channel ready', async () => {
        const q = new Queue('testQueue');
        await q.isReady();
        const msg = { foo: 'bar' };
        await q.publish(msg);
        expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
            'testQueue',
            expect.any(Buffer),
            { persistent: true },
            expect.any(Function)
        );
    });

    test('publish handles nack from channel', async () => {
        const q = new Queue('testQueue');
        await q.isReady();

        mockChannel.sendToQueue.mockImplementationOnce((q, c, o, cb) => cb(new Error('nack')));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const msg = { foo: 'bar' };

        try {
            await q.publish(msg);
        } catch (e) {
            expect(e.message).toBe('nack');
        }

        expect(q.offlinePubQueue).toContainEqual(msg);
        expect(consoleErrorSpy).toHaveBeenCalledWith('[AMQP] nack/error publishing', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    test('close waits for queue and closes connection', async () => {
        const q = new Queue('testQueue');
        await q.isReady();

        q.offlinePubQueue.push({ test: 1 });

        // Start close
        const closePromise = q.close();

        // Simulate queue clearing
        setTimeout(() => { q.offlinePubQueue.shift(); }, 50);

        await closePromise;
        expect(mockChannel.close).toHaveBeenCalled();
        expect(mockConnection.close).toHaveBeenCalled();
    });

    test('reconnect uses exponential backoff', async () => {
        const q = new Queue('testQueue');
        // We don't wait for isReady here because we want to test reconnect directly

        jest.useFakeTimers();
        const connectSpy = jest.spyOn(q, 'connect').mockResolvedValue(true);

        q.reconnect();
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);

        q.reconnect(2);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 4000);

        jest.runAllTimers();
        expect(connectSpy).toHaveBeenCalled();

        jest.useRealTimers();
    });

    test('connect handles failure and reconnects (Line 64, 65)', async () => {
        const q = new Queue('testQueue');
        amqp.connect.mockRejectedValue(new Error('fatal error'));
        const reconnectSpy = jest.spyOn(q, 'reconnect').mockResolvedValue(true);

        await q.connect();
        expect(reconnectSpy).toHaveBeenCalled();
        reconnectSpy.mockRestore();
    });

    test('publish queues message when channel is missing (Line 90-92)', async () => {
        const q = new Queue('testQueue');
        q.channel = null;
        const msg = { foo: 'no-channel' };
        await q.publish(msg);
        expect(q.offlinePubQueue).toContainEqual(msg);
    });

    test('connect sends pending messages from offline queue (Line 59-60)', async () => {
        const q = new Queue('testQueue');
        q.offlinePubQueue.push({ pending: 1 });
        const publishSpy = jest.spyOn(q, 'publish').mockResolvedValue(true);

        await q.connect();
        expect(publishSpy).toHaveBeenCalledWith({ pending: 1 });
        expect(q.offlinePubQueue.length).toBe(0);
        publishSpy.mockRestore();
    });

    test('connection error handler skips "Connection closing" message (Line 23)', async () => {
        const q = new Queue('testQueue');
        await q.isReady();
        const errorCalls = mockConnection.on.mock.calls.filter(call => call[0] === 'error');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        errorCalls[0][1]({ message: 'Connection closing' });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    test('close handles null channel or connection (Line 82, 83)', async () => {
        const q = new Queue('testQueue');
        q.channel = null;
        q.connection = null;
        await q.close();
        expect(mockChannel.close).not.toHaveBeenCalled();
        expect(mockConnection.close).not.toHaveBeenCalled();
    });
});
