const B_TERMISTOR = 4275;

module.exports = class MicrocontrollersModule {
  constructor(measure) {
    this.measure = measure
  }

  digitalToReal(digital, sensor) {
    switch (sensor) {
      case 'Grove - Moisture':
      case 'Fake Grove - Moisture':
      case 'Cloud Moisture':
      case 'Fake Humid':
        return Number((digital * 100 / 950).toFixed(1))
      case 'Grove - Temperature':
      case 'Fake Grove - Temperature':
      case 'Cloud Temperature':
      case 'Fake Temp':
        return Number((1 / (Math.log(1023 / digital - 1) / B_TERMISTOR + 1 / 298.15) - 273.15).toFixed(1))
      default:
        return Number(digital)
    }
  }
}
