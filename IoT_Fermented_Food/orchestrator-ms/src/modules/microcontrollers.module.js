const B_TERMISTOR = 4275;

module.exports = class MicrocontrollersModule {
  constructor(measure) {
    this.measure = measure
  }

  digitalToReal(digital, sensor) {
    if (!sensor) return Number(digital);
    if (sensor.includes('Moisture') || sensor.includes('Humid')) {
      return Number((digital * 100 / 950).toFixed(1));
    }
    if (sensor.includes('Temperature') || sensor.includes('Temp')) {
      return Number((1 / (Math.log(1023 / digital - 1) / B_TERMISTOR + 1 / 298.15) - 273.15).toFixed(1));
    }
    return Number(digital);
  }
}
