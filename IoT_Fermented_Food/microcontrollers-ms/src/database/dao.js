const mysql = require('mysql')

const { DB_NAME, MYSQL, PASSWORD, USERNAME } = require('../config/mysql.config')

const abstractQuery = (db, query, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      error ? reject(error) : resolve(results)
    })
  })
}

module.exports = class Mysql {

  constructor() {
    this.connect()
  }

  connect() {
    this.db = mysql.createConnection(`mysql://${USERNAME}:${PASSWORD}@${MYSQL}/${DB_NAME}`)

    this.db.connect(error => {
      if (error) {
        console.log('Error when connecting to db:', error)
        setTimeout(() => this.connect(), 2000)
      }
    })

    this.db.on('error', error => {
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        this.connect()
      } else {
        throw error
      }
    })
  }

  query(query, values) {
    return abstractQuery(this.db, query, values)
  }

  findByMeasure(measure) {
    return this.query(
      'SELECT * FROM microcontrollers WHERE measure = ?',
      [measure]
    )
  }

  findByUsername(username) {
    return this.query(
      'SELECT * FROM microcontrollers WHERE username = ?',
      [username]
    )
  }

  findByGateway(gatewayId) {
    return this.query(
      'SELECT * FROM microcontrollers WHERE gateway_id = ?',
      [gatewayId]
    )
  }

  async insertMicrocontroller(data) {
    const { ip, measure, sensor, username, thresholdMin, thresholdMax, gateway_id, jurisdiction } = data
    if (gateway_id !== undefined) {
      const result = await this.query(
        'INSERT INTO microcontrollers(ip, measure, sensor, username, thresholdMin, thresholdMax, gateway_id, jurisdiction, paired_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [ip, measure, sensor, username, thresholdMin, thresholdMax, gateway_id, jurisdiction || 'EU']
      )
      return !!result.affectedRows
    } else {
      const result = await this.query(
        'INSERT INTO microcontrollers(ip, measure, sensor, username, thresholdMin, thresholdMax, jurisdiction) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ip, measure, sensor, username, thresholdMin, thresholdMax, jurisdiction || 'EU']
      )
      return !!result.affectedRows
    }
  }

  async pairMicrocontroller(ip, measure, gatewayId) {
    const result = await this.query(
      'UPDATE microcontrollers SET gateway_id = ?, paired_at = NOW() WHERE ip = ? AND measure = ?',
      [gatewayId, ip, measure]
    )
    return !!result.affectedRows
  }

  async updateMicrocontroller(data) {
    const { ip, measure, old_ip, sensor, username, thresholdMin, thresholdMax, gateway_id, jurisdiction } = data
    if (gateway_id !== undefined) {
      const result = await this.query(
        'UPDATE microcontrollers SET ip = ?, measure = ?, sensor = ?, username = ?, thresholdMin = ?, thresholdMax = ?, gateway_id = ?, jurisdiction = ? WHERE ip = ? AND measure = ?',
        [ip, measure, sensor, username, thresholdMin, thresholdMax, gateway_id, jurisdiction || 'EU', old_ip, measure]
      )
      return !!result.affectedRows
    } else {
      const result = await this.query(
        'UPDATE microcontrollers SET ip = ?, measure = ?, sensor = ?, username = ?, thresholdMin = ?, thresholdMax = ?, jurisdiction = ? WHERE ip = ? AND measure = ?',
        [ip, measure, sensor, username, thresholdMin, thresholdMax, jurisdiction || 'EU', old_ip, measure]
      )
      return !!result.affectedRows
    }
  }

  async deleteMicrocontroller({ ip, measure }) {
    const result = await this.query(
      'DELETE FROM microcontrollers WHERE ip = ? AND measure = ?',
      [ip, measure]
    )
    return !!result.affectedRows
  }

}
