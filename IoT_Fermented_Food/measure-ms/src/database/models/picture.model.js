const { model, Schema } = require('mongoose')

const pictureSchema = new Schema({
    date: String,
    timestamp: Number,
    ip: String,
    sensor: String,
    username: String,
    measure: String,
    stage: String,
    stage_id: Number,
    elapsed_minutes: String,
    image_url: String,
    init_timestamp: Number,
    end_timestamp: Number
})

pictureSchema.index({ ip: 1, username: 1, init_timestamp: 1, end_timestamp: 1 })

module.exports = model('Picture', pictureSchema)
