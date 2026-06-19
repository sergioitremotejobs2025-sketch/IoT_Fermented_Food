const axios = require('axios')
const queryString = require('query-string')

const { MEASURE_MS, AI_MS, MICROCONTROLLERS_MS, DEFAULT_TIMEOUT, AI_TRAIN_TIMEOUT } = require('../../config/services.config')

/**
 * Shared secret sent to services so that they can reject un-trusted callers.
 * Must match the INTERNAL_API_KEY env var set on the service pod/container.
 */
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''

/** Build request headers, adding the internal key only for specific calls. */
const buildHeaders = (service) => {
  const needsAuth = [MEASURE_MS, AI_MS, MICROCONTROLLERS_MS].includes(service)
  return needsAuth && INTERNAL_API_KEY
    ? { 'x-internal-api-key': INTERNAL_API_KEY }
    : {}
}

const methodToConnectedService = async (res, url, method, body = {}, status = 200, returnResponse = false, headers) => {
  try {
    const isAiTrain = url.includes(AI_MS) && url.includes('train')
    const timeout = isAiTrain ? AI_TRAIN_TIMEOUT : DEFAULT_TIMEOUT

    const config = { headers, timeout }
    const response = method === 'get'
      ? await axios.get(url, config)
      : method === 'delete'
        ? await axios.delete(url, { ...config, data: body })
        : await axios[method](url, body, config)

    if (returnResponse) return response
    if (!response.data) return res.sendStatus(404)
    return res.status(status).json(response.data)
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Gateway Timeout' })
    }
    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }
    return res.status(502).json({ error: 'Bad Gateway' })
  }
}

module.exports = class ServicesController {

  async getToConnectedService(res, service, path = '', query = {}, returnResponse = false) {
    const url = `http://${service}/${path}?${queryString.stringify(query)}`
    return await methodToConnectedService(res, url, 'get', {}, 200, returnResponse, buildHeaders(service))
  }

  async postToConnectedService(res, service, path = '', body, status, returnResponse) {
    const url = `http://${service}/${path}`
    return await methodToConnectedService(res, url, 'post', body, status, returnResponse, buildHeaders(service))
  }

  async putToConnectedService(res, service, path = '', body, status, returnResponse = false) {
    const url = `http://${service}/${path}`
    return await methodToConnectedService(res, url, 'put', body, status, returnResponse, buildHeaders(service))
  }

  async deleteToConnectedService(res, service, path = '', body) {
    const url = `http://${service}/${path}`
    return await methodToConnectedService(res, url, 'delete', body, 200, false, buildHeaders(service))
  }

}
