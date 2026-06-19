const PATTERNS = {
  'steady': { minTemp: 20, maxTemp: 30, minPh: 4.0, maxPh: 5.0 },
  'ph-crash': { minTemp: 20, maxTemp: 25, minPh: 3.0, maxPh: 3.5 },
  'temp-spike': { minTemp: 35, maxTemp: 45, minPh: 3.5, maxPh: 4.5 },
  'stalled': { minTemp: 5, maxTemp: 15, minPh: 4.5, maxPh: 5.5 }
};

module.exports = PATTERNS;
