const { model, Schema } = require('mongoose')

const humiditySchema = new Schema({
  date: String,
  digital_value: Number,
  end_date: Date,
  end_timestamp: Number,
  init_date: Date,
  init_timestamp: Number,
  ip: String,
  max_value: Number,
  mean_value: Number,
  measure: String,
  min_value: Number,
  n_samples: Number,
  real_value: Number,
  real_values: Array,
  sensor: String,
  std_deviation: Number,
  time_span: Number,
  timestamp: Number,
  username: String
})

humiditySchema.index({ ip: 1, username: 1, init_timestamp: 1, end_timestamp: 1 })

module.exports = model('Humidity', humiditySchema)
