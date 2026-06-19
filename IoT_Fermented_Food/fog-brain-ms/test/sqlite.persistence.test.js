const SQLiteBuffer = require('../src/db/sqlite');
const fs = require('fs');

describe('SQLite Persistence', () => {
    let dbBuffer;
    const testDbPath = './test_telemetry.db';

    beforeEach(() => {
        // Ensure test db is clean before each test
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        dbBuffer = new SQLiteBuffer(testDbPath);
    });

    afterEach(() => {
        if (dbBuffer) dbBuffer.close();
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    test('should write telemetry to local SQLite when cloud is offline', () => {
        const telemetry = {
            sensorId: 'sensor-1',
            measure: 'temperature',
            value: 22.5,
            timestamp: Date.now()
        };

        const result = dbBuffer.insertTelemetry(telemetry);
        expect(result.changes).toBe(1);

        const rows = dbBuffer.getAllTelemetry();
        expect(rows.length).toBe(1);
        expect(rows[0].sensorId).toBe('sensor-1');
        expect(rows[0].measure).toBe('temperature');
        expect(rows[0].value).toBe(22.5);
    });
});
