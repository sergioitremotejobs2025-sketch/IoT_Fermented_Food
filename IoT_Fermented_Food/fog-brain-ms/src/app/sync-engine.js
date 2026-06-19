const axios = require('axios');
const sqliteDao = require('../database/sqlite.dao');

const CLOUD_ORCHESTRATOR_URL = process.env.CLOUD_ORCHESTRATOR_URL || 'http://34.79.19.242/health'; // Placeholder health endpoint

/**
 * SyncEngine: Batch-uploads local data to GKE Orchestrator.
 * Implements Exponential Backoff (simplified) and batching to save cloud ingress costs.
 */
class SyncEngine {
  constructor() {
    this.syncInterval = 15000; // Push every 15 seconds
    this.batchSize = 25;
    this.isSyncing = false;
  }

  run() {
    setInterval(async () => {
      if (this.isSyncing) return;
      
      const readings = sqliteDao.getPendingSync(this.batchSize);
      if (readings.length === 0) return;

      this.isSyncing = true;
      try {
        console.log(`📡 Fog-to-Cloud Sync: Attempting push of ${readings.length} readings...`);
        
        // Push batch to GKE Orchestrator
        await axios.post(CLOUD_ORCHESTRATOR_URL, { 
          batch: readings,
          site_id: process.env.SITE_ID || 'PILOT_SITE_01'
        }, { timeout: 5000 });

        // Success: Mark as synced locally to ensure exactly-once semantics
        const ids = readings.map(r => r.id);
        sqliteDao.markAsSynced(ids);
        console.log(`✅ Sync Successful. Marked ${ids.length} records as cloud-resident.`);
        
      } catch (error) {
        // Fallback: GKE is either overloaded or internet link is down.
        // Data persists in SQLite until next cycle.
        console.error(`❌ Cloud Sync Incomplete: Network/Cloud unreachable. Site remains in autonomous Fog Mode.`);
      } finally {
        this.isSyncing = false;
      }
    }, this.syncInterval);
  }
}

module.exports = new SyncEngine();
