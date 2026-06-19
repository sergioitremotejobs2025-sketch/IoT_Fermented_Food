const Dao = require('../../database/dao')
const MicrocontrollersModule = require('../../modules/microcontrollers.module')

const timeStringToTimestamp = timeString => new Date(timeString).getTime()

const capitalizeFirstLetter = word => word[0].toUpperCase() + word.substring(1)

module.exports = class MeasureModel {

  constructor(measure) {
    this.measure = measure
    this.dao = new Dao()
    this.microsModule = new MicrocontrollersModule(measure)
    this.dao.connect()
  }

  validate = (data, micro) => {
    const value = data[micro.measure]
    if (value === undefined || value === null) {
      throw new Error(`Missing measurement value for ${micro.measure}`)
    }

    // Boundary Checks
    switch (micro.measure) {
      case 'humidity':
        if (value < 0 || value > 1023) throw new Error(`Invalid measurement: Humidity value ${value} out of bounds (0-1023)`)
        break
      case 'temperature':
        if (value < 0 || value > 1023) throw new Error(`Invalid measurement: Temperature value ${value} out of bounds (0-1023)`)
        break
      case 'light':
        if (value < 0 || value > 1023) throw new Error(`Invalid measurement: Light value ${value} out of bounds (0-1023)`)
        break
    }
  }

  getMessage = (data, micro) => {
    this.validate(data, micro)
    const date = new Date()
    const message = {
      date: date.toUTCString(),
      digital_value: data[micro.measure],
      ip: micro.ip,
      measure: micro.measure,
      sensor: micro.sensor,
      timestamp: date.getTime(),
      username: micro.username,
      jurisdiction: micro.jurisdiction || 'EU'
    }

    switch (micro.measure) {
      case 'humidity':
      case 'temperature':
        message.real_value = this.microsModule.digitalToReal(data[micro.measure], micro.sensor)
        break;
      case 'pictures':
        Object.assign(message, data)
        break;
      case 'light':
    }

    return message
  }

  findMeasures = async query => {
    let { end_date, end_timestamp, init_date, init_timestamp, ip, username, limit } = query

    const filter = { ip, username }

    if (init_date || init_timestamp || end_date || end_timestamp) {
      filter.timestamp = {}
      if (init_date || init_timestamp) {
        if (!init_timestamp) init_timestamp = timeStringToTimestamp(init_date)
        filter.timestamp['$gte'] = parseInt(init_timestamp)
      }
      if (end_date || end_timestamp) {
        if (!end_timestamp) end_timestamp = timeStringToTimestamp(end_date)
        filter.timestamp['$lte'] = parseInt(end_timestamp)
      }
    }

    const method = 'find' + capitalizeFirstLetter(this.measure)
    // If limit is provided, we want to sort by latest first to get the MOST recent ones
    if (limit) {
      // We need to modify the DAO to support limit and sort, or handle it here if DAO just passes it.
      // Current DAO findX methods just return Humidity.find(query, ...)
      // Let's assume we can modify the DAO or use the returned promise.
      return await this.dao[method](filter, parseInt(limit))
    }

    return await this.dao[method](filter)
  }

  saveMeasure = async doc => {
    const method = 'save' + capitalizeFirstLetter(this.measure)
    return await this.dao[method](doc)
  }

}
