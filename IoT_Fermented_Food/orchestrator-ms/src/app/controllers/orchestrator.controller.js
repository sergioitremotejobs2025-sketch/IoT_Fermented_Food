const { AUTH_MS, MEASURE_MS, MICROCONTROLLERS_MS, AI_MS } = require('../../config/services.config')
const { hashPassword } = require('../../helpers/helpers')

const JwtModule = require('../../modules/jwt.module')
const ServicesController = require('./services.controller')

const jwt = new JwtModule()
const servicesController = new ServicesController()
const MicrocontrollersModule = require('../../modules/microcontrollers.module');

const doAuth = async (req, res, path) => {
  const body = req.body
  if (!body.password || !body.username) return res.sendStatus(400)

  body.password = hashPassword(body.password)
  body.refreshToken = jwt.generateRefreshToken()

  const response = await servicesController.postToConnectedService(res, AUTH_MS, path, body, null, true)
  if (String(response.data) !== 'true') return res.sendStatus(401)

  const accessToken = jwt.generateToken({ username: body.username })
  return res.json({ accessToken, refreshToken: body.refreshToken })
}

module.exports = class OrchestratorController {

  async getMeasureService(req, res) {
    let { path, ...query } = req.query
    if (!path) path = req.route.path.substring(1)
    query.username = req.user.username

    // Call service but get full response to broadcast it
    const response = await servicesController.getToConnectedService(res, MEASURE_MS, path, query, true)

    if (response && response.data) {
      // If temperature, convert digital values to real Celsius values
      if (path === 'temperature') {
        const microsModule = new MicrocontrollersModule(path);
        response.data = response.data.map(item => {
          if (item.digital_value !== undefined) {
            item.value = microsModule.digitalToReal(item.digital_value, item.sensor);
            delete item.digital_value;
          }
          return item;
        });
      }

      const io = req.app.get('io');
      if (io) {
        // Broadcast the measurement update to all clients
        io.emit('measure_update', {
          measure: path,
          data: response.data,
          username: req.user.username
        });
      }
      return res.json(response.data);
    }
    if (!res.headersSent) {
      return res.sendStatus(404);
    }
  }

  async postMeasureService(req, res) {
    let { path, ...body } = req.body
    if (!path) path = req.route.path.substring(1)
    body.username = req.user.username
    await servicesController.postToConnectedService(res, MEASURE_MS, path, body, 201)

  }

  async login(req, res) {
    await doAuth(req, res, 'login')
  }

  async register(req, res) {
    await doAuth(req, res, 'register')
  }

  async refresh(req, res) {
    const accessToken = jwt.getTokenFromHeaders(req.headers)
    const { refreshToken } = req.body
    const payload = jwt.getPayload(accessToken)

    if (!refreshToken || !accessToken || !payload || !payload.username) return res.sendStatus(400)
    if (!jwt.isRefreshable(accessToken)) return res.sendStatus(401)

    const newRefreshToken = jwt.generateRefreshToken()
    const { username } = payload
    const body = { newRefreshToken, refreshToken, username }
    const response = await servicesController.postToConnectedService(res, AUTH_MS, 'refresh', body, null, true)

    if (!response.data) return res.sendStatus(400)
    return res.json({
      accessToken: jwt.generateToken({ username }),
      refreshToken: newRefreshToken
    })
  }

  async getMicrocontrollers(req, res) {
    const { username } = req.user
    await servicesController.getToConnectedService(res, MICROCONTROLLERS_MS, undefined, { username })
  }

  async postMicrocontrollers(req, res) {
    const microcontroller = req.body
    // Ensure username is present
    microcontroller.username = req.user.username
    await servicesController.postToConnectedService(res, MICROCONTROLLERS_MS, undefined, microcontroller, 201)
  }

  async putMicrocontrollers(req, res) {
    const updatedMicrocontroller = req.body
    // Ensure username is present
    updatedMicrocontroller.username = req.user.username
    await servicesController.putToConnectedService(res, MICROCONTROLLERS_MS, undefined, updatedMicrocontroller, 201)
  }

  async deleteMicrocontrollers(req, res) {
    const { ip, measure } = req.query
    await servicesController.deleteToConnectedService(
      res,
      MICROCONTROLLERS_MS,
      undefined,
      {
        ip,
        measure,
        username: req.user.username
      }
    )
  }

  async changePassword(req, res) {
    const { password } = req.body
    if (!password) return res.sendStatus(400)

    const body = {
      username: req.user.username,
      password: hashPassword(password)
    }

    const response = await servicesController.putToConnectedService(res, AUTH_MS, 'change-password', body, null, true)
    if (!response.data) return res.sendStatus(400)
    return res.json({ success: response.data === 'true' })
  }

  async trainAI(req, res) {
    const { ip, measure, limit } = req.body
    const body = {
      username: req.user.username,
      ip,
      measure,
      limit: limit || 1000
    }
    await servicesController.postToConnectedService(res, AI_MS, 'train', body)
  }

  async predictAI(req, res) {
    const { ip, measure, recent_values } = req.body
    const body = {
      username: req.user.username,
      ip,
      measure,
      recent_values
    }
    await servicesController.postToConnectedService(res, AI_MS, 'predict', body)
  }

  async evaluateAI(req, res) {
    const { ip, measure } = req.body
    const body = {
      username: req.user.username,
      ip,
      measure
    }
    await servicesController.postToConnectedService(res, AI_MS, 'evaluate', body)
  }


  async getMeasureHistory(req, res) {
    console.log('[orchestrator] getMeasureHistory called:', req.query)
    const { ip, measure, range } = req.query
    const { username } = req.user

    const rangeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }

    const duration = rangeMap[range] || rangeMap['24h']
    const init_timestamp = Date.now() - duration

    const path = measure + 's' // humidity -> humidities, temperature -> temperatures
    const query = { ip, username, init_timestamp }

    const response = await servicesController.getToConnectedService(res, MEASURE_MS, path, query, true)
    const microsModule = new MicrocontrollersModule(measure)
    if (response && response.data) {
      let history = []
      response.data.forEach(item => {
        if (item.real_values && item.real_values.length > 0) {
          const count = item.real_values.length
          const start = new Date(item.init_date).getTime()
          const end = new Date(item.end_date).getTime()
          const step = count > 1 ? (end - start) / (count - 1) : 0
          item.real_values.forEach((val, i) => {
            history.push({
              date: new Date(start + i * step).toUTCString(),
              value: val
            })
          })
        } else if (item.real_value !== undefined) {
          history.push({
            date: item.date,
            value: item.real_value
          })
        } else if (item.digital_value !== undefined) {
          // Convert raw digital value to real units if temperature
          let value = item.digital_value
          if (measure === 'temperature') {
            value = microsModule.digitalToReal(item.digital_value, item.sensor)
          }
          history.push({
            date: item.date,
            value: value
          })
        }
      })
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      return res.json(history)
    }

    if (response && response.data) {
      let history = []
      response.data.forEach(item => {
        if (item.real_values && item.real_values.length > 0) {
          // Aggregated record from stats-ms
          const count = item.real_values.length
          const start = new Date(item.init_date).getTime()
          const end = new Date(item.end_date).getTime()
          const step = count > 1 ? (end - start) / (count - 1) : 0

          item.real_values.forEach((val, i) => {
            history.push({
              date: new Date(start + i * step).toUTCString(),
              value: val
            })
          })
        } else if (item.real_value !== undefined) {
          // Raw record from measure-ms
          history.push({
            date: item.date,
            value: item.real_value
          })
        } else if (item.digital_value !== undefined) {
          // Fallback for light or other
          history.push({
            date: item.date,
            value: item.digital_value
          })
        }
      })
      
      // Sort by date just in case
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      return res.json(history)
    }

    if (!res.headersSent) {
      return res.sendStatus(404)
    }
  }

  async postSimulationPattern(req, res) {
    const { pattern } = req.body
    const { username } = req.user

    const response = await servicesController.getToConnectedService(res, MICROCONTROLLERS_MS, '', { username }, true)
    
    if (!response || !response.data) return

    const fakeSensors = response.data.filter(sensor => sensor.ip && sensor.ip.includes('fake-fermentation'))

    const axios = require('axios')
    const promises = fakeSensors.map(sensor => {
      const url = `http://${sensor.ip}/pattern`
      return axios.post(url, { pattern })
    })

    const results = await Promise.allSettled(promises)
    const allFailed = results.length > 0 && results.every(r => r.status === 'rejected')
    
    if (allFailed) {
      return res.status(500).json({ status: 'error', message: 'Internal requests failed' })
    }

    results.filter(r => r.status === 'rejected').forEach(r => console.error(r.reason))

    return res.status(200).json({ status: 'success' })
  }

}
