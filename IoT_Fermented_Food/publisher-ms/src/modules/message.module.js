const B_TERMISTOR = 3975

const digitalToReal = (digital, sensor) => {
  const digital_value = Number(digital);
  let real_value = 0;

  switch (sensor) {
    case 'Grove - Moisture':
    case 'Fake Grove - Moisture':
    case 'Local Hum 1':
    case 'Cloud Moisture':
      real_value = Number((digital_value * 100 / 950).toFixed(1));
      break;
    case 'Grove - Temperature':
    case 'Fake Grove - Temperature':
    case 'Local Temp 1':
    case 'Cloud Temperature':
      real_value = Number((1 / (Math.log(1023 / digital_value - 1) / B_TERMISTOR + 1 / 298.15) - 273.15).toFixed(1));
      break;
    case 'Fake Humid':
      real_value = Number(((digital_value * 100) / 1023).toFixed(1));
      break;
    case 'Fake Temp':
      real_value = Number(((digital_value * 40) / 1023).toFixed(1));
      break;
    default:
      real_value = digital_value;
      break;
  }
  return real_value;
}

const getMessage = (response, micro) => {
  const timestamp = Date.now()
  const date = new Date(timestamp).toUTCString()
  const digital_value = Number(response[micro.measure])
  const real_value = digitalToReal(digital_value, micro.sensor)

  return {
    date,
    digital_value,
    ip: micro.ip,
    measure: micro.measure,
    sensor: micro.sensor,
    timestamp,
    username: micro.username,
    jurisdiction: micro.jurisdiction || 'EU',
    real_value
  }
}

module.exports = {
  digitalToReal,
  getMessage
}
