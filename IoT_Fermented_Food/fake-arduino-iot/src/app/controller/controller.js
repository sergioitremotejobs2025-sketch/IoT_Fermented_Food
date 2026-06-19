const PATTERNS = require('../config/patterns');

// Helper to calculate digital value from desired real value for Grove Temperature
const realTempToDigital = (celsius) => {
  const B_TERMISTOR = 4275;
  const T0 = 298.15;
  const kelvin = celsius + 273.15;
  // Boundary check to prevent math errors
  if (kelvin === 0) return 1023; 
  const ln_val = B_TERMISTOR * (1 / kelvin - 1 / T0);
  const digital = 1023 / (Math.exp(ln_val) + 1);
  return Math.round(digital);
}

// Helper to calculate digital value from pH (0-14 range to 0-1023)
const realPhToDigital = (ph) => {
  // Boundary check
  if (ph < 0) ph = 0;
  if (ph > 14) ph = 14;
  return Math.round(ph * 1023 / 14);
}

const getPatternValue = (min, max, cycleSeconds = 60) => {
  const time = Date.now() / 1000;
  const normalizedSin = (Math.sin((2 * Math.PI * time) / cycleSeconds) + 1) / 2; // 0 to 1
  const noise = (Math.random() - 0.5) * (max - min) * 0.05; // 5% noise
  return normalizedSin * (max - min) + min + noise;
}

const switchLight = status => status === 'on' ? 1 : 0;

module.exports = class Controller {

  constructor() {
    this.light = 0;
    this.currentPattern = 'steady';
  }

  randomPh() {
    const config = PATTERNS[this.currentPattern] || PATTERNS['steady'];
    return realPhToDigital(getPatternValue(config.minPh, config.maxPh, 120));
  }

  randomTemperature() {
    const config = PATTERNS[this.currentPattern] || PATTERNS['steady'];
    return realTempToDigital(getPatternValue(config.minTemp, config.maxTemp, 180));
  }

  getPh = (req, res) => {
    return res.json({ ph: this.randomPh() });
  }
  
  // Legacy support just in case
  getHumidity = (req, res) => {
    return res.json({ humidity: this.randomPh() }); // Returning ph value as humidity just so we don't break old frontend immediately
  }

  getLight = (req, res) => {
    return res.json({ light: this.light });
  }

  getTemperature = (req, res) => {
    return res.json({ temperature: this.randomTemperature() });
  }

  postLight = (req, res) => {
    this.light = switchLight(req.params.status);
    return res.json({ light: this.light });
  }

  postPattern = (req, res) => {
    const pattern = req.body.pattern;
    if (PATTERNS[pattern]) {
      this.currentPattern = pattern;
      return res.json({ status: 'success', pattern: pattern });
    } else {
      return res.status(400).json({ error: 'unknown_phase' });
    }
  }

}
