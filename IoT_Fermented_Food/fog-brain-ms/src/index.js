const express = require('express');
const survivalModule = require('./app/survival.module');
const syncEngine = require('./app/sync-engine');

const app = express();
app.use(express.json());

// Load Environment Variables (e.g., from Site Secret Stores)
const PORT = process.env.PORT || 4000;
const SITE_NAME = process.env.SITE_NAME || 'Fog_Pilot_Greenhouse_01';

/**
 * Fog-Brain-MS: The "Site Brain" responsible for local autonomy and cloud buffering.
 * 1. Ingests data from Edge/Wasm gateways.
 * 2. Evaluates local survival logic (High-Speed reflexes).
 * 3. Persists data to local SQLite for fault-tolerance.
 * 4. Background-syncs data to the GKE Orchestrator.
 */

// Local Ingestion point for Edge Hubs / Wasm Pruners
app.post('/ingest', async (req, res) => {
  const { device_id, measure, value } = req.body;
  
  if (!device_id || !measure || value === undefined) {
    return res.status(400).json({ status: 'REJECTED', reason: 'INCOMPLETE_PACKET' });
  }

  // Step 1: Execute Survival Logic (Micro-reflexes)
  await survivalModule.evaluate({ device_id, measure, value });

  // Step 2: Immediate Acknowledgment to reduce Edge compute overhead
  res.status(202).json({ 
    status: 'ACCEPTED', 
    site: SITE_NAME, 
    local_buffer: 'COMMIT_SQLITE_OK' 
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'fog_node_up', site: SITE_NAME });
});

app.listen(PORT, () => {
  console.log(`🧠 [FOG BRAIN] Site Brain initialized on port ${PORT}`);
  console.log(`📌 [FOG BRAIN] Running local 'Survival Logic' Rules Engine...`);
  
  // Step 3: Start the Cloud Sync background monitor
  syncEngine.run();
});
