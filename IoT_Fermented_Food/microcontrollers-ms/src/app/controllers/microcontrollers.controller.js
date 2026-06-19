const NodeCache = require('node-cache')

const { isValidMicrocontroller } = require('../../helpers/helpers')
const Dao = require('../../database/dao')

const cache = new NodeCache()
const dao = new Dao()

module.exports = class OrchestratorController {

  async getMicrocontrollers(req, res) {
    const { username, gateway_id } = req.query

    if (gateway_id) {
      let response = cache.get(`/gateway/${gateway_id}`)
      if (response) return res.status(200).json(response)

      response = await dao.findByGateway(gateway_id)
      if (response.length) cache.set(`/gateway/${gateway_id}`, response)
      return res.status(200).json(response)
    }

    let response = cache.get(`/?username=${username}`)
    if (response) return res.status(200).json(response)

    response = await dao.findByUsername(username)
    if (response.length) cache.set(`/?username=${username}`, response)
    return res.status(200).json(response)
  }

  async getMicrocontrollersFromMS(req, res) {
    const { measure } = req.params

    let response = cache.get(`/${measure}`)
    if (response) return res.status(200).json(response)

    response = await dao.findByMeasure(measure)
    if (response.length) cache.set(`/${measure}`, response)
    return res.status(200).json(response)
  }

  async pairMicrocontroller(req, res) {
    const { ip, measure, gateway_id } = req.body

    if (!ip || !measure || !gateway_id) return res.sendStatus(400)

    try {
      const success = await dao.pairMicrocontroller(ip, measure, gateway_id)
      if (!success) return res.sendStatus(404)

      // Invalidate caches
      cache.del([`/${measure}`, `/gateway/${gateway_id}`])
      
      return res.status(200).json({ status: 'paired', ip, gateway_id })
    } catch (error) {
      return res.sendStatus(500)
    }
  }

  async postMicrocontrollers(req, res) {
    const microcontroller = req.body

    if (!isValidMicrocontroller(microcontroller)) return res.sendStatus(400)

    cache.del([`/?username=${microcontroller.username}`, `/${microcontroller.measure}`])

    try {
      const changes = await dao.insertMicrocontroller(microcontroller)
      if (!changes) return res.sendStatus(204)

      return res.status(201).json(microcontroller)
    } catch (error) {
      console.error('Error in postMicrocontrollers:', error)
      return res.sendStatus(400)
    }

  }

  async putMicrocontrollers(req, res) {
    const updatedMicrocontroller = req.body
    const { old_ip, ...micro } = updatedMicrocontroller

    if (!isValidMicrocontroller(micro) || !old_ip) return res.sendStatus(400)

    cache.del([`/?username=${micro.username}`, `/${micro.measure}`])

    try {
      const changes = await dao.updateMicrocontroller(updatedMicrocontroller)
      if (!changes) return res.sendStatus(404)

      delete updatedMicrocontroller.old_ip
      return res.status(201).json(updatedMicrocontroller)
    } catch (error) {
      return res.sendStatus(400)
    }
  }

  async deleteMicrocontrollers(req, res) {
    const microcontroller = req.body
    try {
      const changes = await dao.deleteMicrocontroller(microcontroller)
      if (!changes) return res.sendStatus(404)

      cache.del([`/?username=${microcontroller.username}`, `/${microcontroller.measure}`])

      return res.sendStatus(200)
    } catch (error) {
      return res.sendStatus(400)
    }
  }

}
