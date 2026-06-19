const Database = require('better-sqlite3');

class SQLiteBuffer {
    constructor(dbPath = './telemetry_buffer.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    init() {
        const stmt = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS telemetry_buffer (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sensorId TEXT NOT NULL,
                measure TEXT NOT NULL,
                value REAL NOT NULL,
                timestamp INTEGER NOT NULL,
                synced INTEGER DEFAULT 0
            )
        `);
        stmt.run();
    }

    insertTelemetry(telemetry) {
        const stmt = this.db.prepare(`
            INSERT INTO telemetry_buffer (sensorId, measure, value, timestamp)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(telemetry.sensorId, telemetry.measure, telemetry.value, telemetry.timestamp);
    }

    getAllTelemetry() {
        const stmt = this.db.prepare(`
            SELECT * FROM telemetry_buffer
        `);
        return stmt.all();
    }

    getUnsyncedTelemetry() {
        const stmt = this.db.prepare(`
            SELECT * FROM telemetry_buffer WHERE synced = 0
        `);
        return stmt.all();
    }

    markAsSynced(ids) {
        if (!ids || ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        const stmt = this.db.prepare(`
            UPDATE telemetry_buffer SET synced = 1 WHERE id IN (${placeholders})
        `);
        return stmt.run(...ids);
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = SQLiteBuffer;
