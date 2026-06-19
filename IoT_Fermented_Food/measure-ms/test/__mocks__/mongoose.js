const humidities = require('../humidities.json')
const lights = require('../lights.json')
const pictures = require('../pictures.json')
const temperatures = require('../temperatures.json')

const makeModel = (name) => {
  // Returns a constructor whose instances have .save(), plus a static .find()
  function MockModel(doc) {
    Object.assign(this, doc)
  }

  MockModel.find = (doc, keys) => {
    let result = []
    if (doc.ip && doc.username) {
      if (name === 'Humidity') result = [humidities[0]]
      if (name === 'Light') result = [lights[0]]
      if (name === 'Temperature') result = [temperatures[0]]
      if (name === 'Picture') result = [pictures[0]]
    }

    const query = {
      sort: () => query,
      limit: () => query,
      then: (resolve) => resolve(result),
      catch: (reject) => { /* no-op */ }
    }

    // Add thenable behavior to make it awaitable
    // But wait, it should actually return a Promise if await is called.
    return query
  }

  MockModel.prototype.save = function () {
    return Promise.resolve(this)
  }

  return MockModel
}

module.exports = {
  connect: (url, options) => {
    return Promise.resolve()
  },
  model: (name, schema) => makeModel(name),
  connection: {
    on: (event, cb) => { cb(event) },
    once: (event, cb) => { cb(event) }
  },
  Schema: class {
    constructor(schema) { this.schema = schema }
    index() { /* no-op in tests */ }
  }
}
