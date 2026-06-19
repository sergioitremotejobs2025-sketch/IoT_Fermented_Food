const axios = require('axios')

const { B_TERMISTOR, MICROCONTROLLERS_MS } = require('../app/constants/constants')
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

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


  async getMicrocontrollers() {
    const headers = INTERNAL_API_KEY ? { 'x-internal-api-key': INTERNAL_API_KEY } : {}
    const response = await axios.get(`http://${MICROCONTROLLERS_MS}/${this.measure}`, { headers })
    return response.data
  }

}
