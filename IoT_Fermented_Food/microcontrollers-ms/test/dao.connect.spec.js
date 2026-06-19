// DAO connection error and error‑event branch coverage
const Dao = require('../src/database/dao');

// Mock mysql with controllable behavior
let mockConnection;
jest.mock('mysql', () => {
    return {
        createConnection: jest.fn(() => mockConnection)
    };
});

describe('Dao connection error branches', () => {
    beforeEach(() => {
        // reset mock connection for each test
        mockConnection = {
            connect: jest.fn(),
            on: jest.fn(),
            query: jest.fn((q, v, cb) => cb(null, []))
        };
        // mock on to store handler
        mockConnection.on.mockImplementation((event, handler) => {
            if (event === 'error') mockConnection.errorHandler = handler;
        });
    });

    test('connect error logs and calls handleDisconnect', () => {
        jest.useFakeTimers();
        // simulate connect error
        mockConnection.connect.mockImplementation(cb => cb(new Error('boom')));
        // provide a global handleDisconnect mock
        global.handleDisconnect = jest.fn();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        const dao = new Dao(); // constructor calls connect()
        expect(consoleSpy).toHaveBeenCalledWith('Error when connecting to db:', expect.any(Error));

        jest.advanceTimersByTime(2000); // Wait for setTimeout

        // After 2s, connect() should be called again
        expect(mockConnection.connect).toHaveBeenCalledTimes(2);
        consoleSpy.mockRestore();
        jest.useRealTimers();
    });

    test('PROTOCOL_CONNECTION_LOST triggers reconnect', () => {
        // normal connect (no error)
        mockConnection.connect.mockImplementation(cb => cb && cb(null));
        const dao = new Dao();
        const reconnectSpy = jest.spyOn(dao, 'connect');
        // simulate error event
        mockConnection.errorHandler({ code: 'PROTOCOL_CONNECTION_LOST' });
        expect(reconnectSpy).toHaveBeenCalledTimes(1);
    });

    test('non‑PROTOCOL error is re‑thrown', () => {
        mockConnection.connect.mockImplementation(cb => cb(null));
        const dao = new Dao();
        const error = new Error('some other error');
        error.code = 'OTHER_ERROR';
        expect(() => mockConnection.errorHandler(error)).toThrow(error);
    });
});
