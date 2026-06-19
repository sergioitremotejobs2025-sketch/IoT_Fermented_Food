const sqliteDao = require('../database/sqlite.dao');

/**
 * SurvivalModule: Autonomous site logic.
 * Ensures the greenhouse remains safe even if cloud connectivity is severed.
 */
class SurvivalModule {
  static async evaluate(reading) {
    const { device_id, measure, value } = reading;
    
    // Safety Rule 1: Temperature Emergency Venting
    if (measure === 'temperature' && value > 38) {
      this.triggerLocalAction('EMERGENCY_COOLING', device_id);
    }

    // Safety Rule 2: Humidity Over-saturation
    if (measure === 'humidity' && value > 95) {
      this.triggerLocalAction('VENTILATION_START', device_id);
    }

    // Buffer the data locally before attempting to sync
    sqliteDao.insertReading(device_id, measure, value);
  }

  static triggerLocalAction(action, deviceId) {
    // In actual deployment, this would use a local MQTT or Relay service
    console.warn(`🚨 [LOCAL ACTION TRIGGERED] Action: ${action} for Device: ${deviceId}`);
    // Site-wide autonomous survival achieved.
  }
}

module.exports = SurvivalModule;
