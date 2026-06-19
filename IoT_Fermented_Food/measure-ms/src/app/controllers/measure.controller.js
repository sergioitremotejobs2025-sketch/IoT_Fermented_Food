const axios = require('axios')

const { PING_TIMEOUT } = require('../constants/constants')
const MicrocontrollersModule = require('../../modules/microcontrollers.module')
const MeasureModel = require('../models/measure.model')

module.exports = class MeasureController {

  constructor(measure) {
    this.measure = measure
    this.microsModule = new MicrocontrollersModule(measure)
    this.measureModel = new MeasureModel(measure)
  }

  getMeasure = async (req, res) => {
    try {
      const { username } = req.query
      let userMicros = await this.microsModule.getMicrocontrollers()
      userMicros = userMicros.filter(micro => micro.username === username)
      const responses = await Promise.all(userMicros.map(this.requestMeasure))
      res.status(200).json(responses)
    } catch (e) {
      res.status(500).send(e.message)
    }
  }

  requestMeasure = async micro => {
    try {
      const response = await axios.get(`http://${micro.ip}/${micro.measure}`, { timeout: PING_TIMEOUT })
      return this.measureModel.getMessage(response.data, micro)
    } catch (error) {
      return
    }
  }

  getMeasures = async (req, res) => {
    try {
      res.status(200).json(await this.measureModel.findMeasures(req.query))
    } catch (error) {
      res.sendStatus(400)
    }
  }

  postLight = async (req, res) => {
    if (this.measure === 'light') {
      const { ip, status, username } = req.body
      const userMicros = await this.microsModule.getMicrocontrollers()
      const micros = userMicros.filter(micro => micro.username === username && micro.ip === ip)

      if (micros.length === 1) {
        try {
          const response = await axios.post(`http://${ip}/light/${status}`, {}, { timeout: PING_TIMEOUT })
          return res.status(200).json(this.measureModel.getMessage(response.data, micros[0]))
        } catch (error) {
          const status = error.message.includes('Invalid measurement') ? 422 : 400
          return res.status(status).json({ error: error.message })
        }
      }
      return res.status(404).json({ error: 'MCU not found' })
    }
    return res.status(400).json({ error: 'Invalid operation' })
  }

  postMeasure = async (req, res) => {
    try {
      const { username, ip, ...data } = req.body
      console.log(`[measure-ms] Received postMeasure for ${username}@${ip}:`, data)
      const micro = (await this.microsModule.getMicrocontrollers())
        .find(m => m.username === username && m.ip === ip)

      if (!micro) {
        console.error(`[measure-ms] MCU not found for ${username}@${ip}`)
        return res.status(404).json({ error: 'MCU not found' })
      }

      const message = this.measureModel.getMessage(data, micro)
      console.log(`[measure-ms] Generated message:`, message)
      await this.measureModel.saveMeasure(message)
      res.status(201).json(message)
    } catch (error) {
      console.error(`[measure-ms] Error in postMeasure:`, error.message)
      const status = error.message.includes('Invalid measurement') ? 422 : 400
      res.status(status).json({ error: error.message })
    }
  }


}
