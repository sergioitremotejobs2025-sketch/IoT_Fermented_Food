const mongoose = require('mongoose')

const { DB_NAME, MONGO, PASSWORD, USERNAME } = require('../config/mongodb.config')
const Humidity = require('./models/humidity.model')
const Light = require('./models/light.model')
const Temperature = require('./models/temperature.model')
const PictureModel = require('./models/picture.model')

module.exports = class MongoDB {

  constructor() {
    this.db = mongoose.connection
  }

  connect() {
    const url = `mongodb://${USERNAME}:${PASSWORD}@${MONGO}`
    const options = {
      dbName: DB_NAME
    }

    mongoose.connect(url, options).catch(error => console.log(error))

    this.db.once('open', () => console.log('Connection successful'))
    this.db.on('error', error => console.log(error))
  }

  async findHumidity(humidity, limit) {
    let query = Humidity.find(humidity, { _id: 0, __v: 0 })
    if (limit) query = query.sort({ timestamp: -1 }).limit(limit)
    return await query
  }

  async findLight(light, limit) {
    let query = Light.find(light, { _id: 0, __v: 0 })
    if (limit) query = query.sort({ timestamp: -1 }).limit(limit)
    return await query
  }

  async findTemperature(temperature, limit) {
    let query = Temperature.find(temperature, { _id: 0, __v: 0 })
    if (limit) query = query.sort({ timestamp: -1 }).limit(limit)
    return await query
  }

  async findPictures(query, limit) {
    let q = PictureModel.find(query, { _id: 0, __v: 0 })
    if (limit) q = q.sort({ timestamp: -1 }).limit(limit)
    return await q
  }

  async savePicture(doc) {
    const record = new PictureModel(doc)
    return await record.save()
  }

  async saveHumidity(doc) {
    const record = new Humidity(doc)
    return await record.save()
  }

  async saveLight(doc) {
    const record = new Light(doc)
    return await record.save()
  }

  async saveTemperature(doc) {
    const record = new Temperature(doc)
    return await record.save()
  }

}
