const Database = require('better-sqlite3');
const path = require('path');

class SQLiteDao {
  constructor() {
    this.db = new Database(path.join(__dirname, '../../fog-cache.db'));
    this.init();
  }

  init() {
    // Persistent buffer table to prevent data loss during long-term cloud outages
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sensor_buffer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        measure TEXT NOT NULL,
        value REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      )
    `);
  }

  insertReading(device_id, measure, value) {
    const stmt = this.db.prepare('INSERT INTO sensor_buffer (device_id, measure, value) VALUES (?, ?, ?)');
    return stmt.run(device_id, measure, value);
  }

  getPendingSync(limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM sensor_buffer WHERE synced = 0 LIMIT ?');
    return stmt.all(limit);
  }

  markAsSynced(ids) {
    if (ids.length === 0) return;
    const stmt = this.db.prepare(`UPDATE sensor_buffer SET synced = 1 WHERE id IN (${ids.join(',')})`);
    return stmt.run();
  }

  pruneSyncedReadings() {
    // Maintain lean local storage by removing synced records periodically
    return this.db.prepare('DELETE FROM sensor_buffer WHERE synced = 1').run();
  }
}

module.exports = new SQLiteDao();
