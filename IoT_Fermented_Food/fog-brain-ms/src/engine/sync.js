const axios = require('axios');

class SyncEngine {
    constructor(dbBuffer, cloudUrl, pollIntervalMs = 5000) {
        this.dbBuffer = dbBuffer;
        this.cloudUrl = cloudUrl;
        this.pollIntervalMs = pollIntervalMs;
        this.intervalId = null;
    }

    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.sync(), this.pollIntervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async sync() {
        try {
            const records = this.dbBuffer.getUnsyncedTelemetry();
            if (!records || records.length === 0) return;

            const response = await axios.post(this.cloudUrl, records);
            
            if (response.status === 200) {
                const ids = records.map(r => r.id);
                this.dbBuffer.markAsSynced(ids);
            }
        } catch (error) {
            console.error('Sync failed:', error.message);
        }
    }
}

module.exports = SyncEngine;
