const axios = require('axios')

const { MICROCONTROLLERS_MS, MEASURE_MS, PING_TIMEOUT } = require('../config/config')
const { getMessage } = require('../modules/message.module')

const getMicrocontrollers = async measure => {
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''
  const config = INTERNAL_API_KEY ? { headers: { 'x-internal-api-key': INTERNAL_API_KEY } } : {}
  const response = await axios.get(`http://${MICROCONTROLLERS_MS}/${measure}`, config)
  return response.data
}

const requestMeasure = async micro => {
  try {
    const response = await axios.get(`http://${micro.ip}/${micro.measure}`, { timeout: PING_TIMEOUT })
    return response.data
  } catch (error) {
    // skip silent
  }
}

const saveMeasure = async (measure, data) => {
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''
  const config = INTERNAL_API_KEY ? { headers: { 'x-internal-api-key': INTERNAL_API_KEY } } : {}
  const url = `http://${MEASURE_MS}/${measure}`
  console.log(`[publisher-ms] Saving to: ${url}`)
  try {
    await axios.post(url, data, config)
  } catch (error) {
    console.error(`[publisher-ms] Error saving ${measure} to measure-ms:`, error.message)
  }
}

module.exports = { getMicrocontrollers, requestMeasure, saveMeasure }
