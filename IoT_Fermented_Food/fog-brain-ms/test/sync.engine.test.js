const SyncEngine = require('../src/engine/sync');
const SQLiteBuffer = require('../src/db/sqlite');
const axios = require('axios');
const fs = require('fs');

jest.mock('axios');

describe('Sync Engine', () => {
    let dbBuffer;
    let syncEngine;
    const testDbPath = './test_sync.db';

    beforeEach(() => {
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
        dbBuffer = new SQLiteBuffer(testDbPath);
        syncEngine = new SyncEngine(dbBuffer, 'http://cloud-url');
    });

    afterEach(() => {
        if (dbBuffer) dbBuffer.close();
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
        jest.clearAllMocks();
    });

    test('should batch-upload buffered data when connectivity is restored and mark as synced on 200 OK', async () => {
        // Insert mock data
        dbBuffer.insertTelemetry({ sensorId: 's1', measure: 'temp', value: 20, timestamp: 1000 });
        dbBuffer.insertTelemetry({ sensorId: 's2', measure: 'ph', value: 4.5, timestamp: 2000 });

        // Mock successful cloud response
        axios.post.mockResolvedValue({ status: 200 });

        await syncEngine.sync();

        // Expect axios to have been called with the data
        expect(axios.post).toHaveBeenCalledTimes(1);
        const requestData = axios.post.mock.calls[0][1];
        expect(requestData.length).toBe(2);

        // Expect records to be marked as synced
        const unsynced = dbBuffer.getUnsyncedTelemetry();
        expect(unsynced.length).toBe(0);
    });

    test('should not mark records as synced if cloud returns error', async () => {
        // Insert mock data
        dbBuffer.insertTelemetry({ sensorId: 's1', measure: 'temp', value: 20, timestamp: 1000 });

        // Mock failed cloud response
        axios.post.mockRejectedValue(new Error('Network Error'));

        await syncEngine.sync();

        // Expect records to remain unsynced
        const unsynced = dbBuffer.getUnsyncedTelemetry();
        expect(unsynced.length).toBe(1);
    });
});
