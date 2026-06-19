const axios = require('axios')

const { MICROCONTROLLERS_MS, PING_TIMEOUT, TEN_HOURS_MS } = require('../constants/constants')

/**
 * PictureScheduler — captures a picture from every registered camera
 * microcontroller every 10 hours and persists it to MongoDB.
 *
 * Dependencies are injected so the class is fully unit-testable.
 */
class PictureScheduler {

    /**
     * @param {object} db — DAO instance with savePicture(doc)
     * @param {object} microsModule — MicrocontrollersModule for 'pictures'
     */
    constructor(db, microsModule) {
        this.db = db
        this.microsModule = microsModule
        this._interval = null
    }

    /**
     * Start the scheduler. Captures immediately, then every intervalMs.
     * @param {number} intervalMs — defaults to 10 hours
     */
    start(intervalMs = TEN_HOURS_MS) {
        this.capture()
        this._interval = setInterval(() => this.capture(), intervalMs)
    }

    /** Stop the scheduler (clears the interval). */
    stop() {
        if (this._interval !== null) {
            clearInterval(this._interval)
            this._interval = null
        }
    }

    /**
     * Fetch the current picture from EVERY registered camera microcontroller
     * and persist each snapshot to the database.
     */
    async capture() {
        try {
            const micros = await this.microsModule.getMicrocontrollers()
            const cameraMicros = micros.filter(m => m.measure === 'pictures')
            await Promise.all(cameraMicros.map(micro => this._captureOne(micro)))
        } catch (error) {
            console.error('[PictureScheduler] capture error:', error.message)
        }
    }

    async _captureOne(micro) {
        try {
            const response = await axios.get(`http://${micro.ip}/${micro.measure}`, { timeout: PING_TIMEOUT })
            const data = response.data
            const now = new Date()

            const doc = {
                date: now.toUTCString(),
                timestamp: now.getTime(),
                init_timestamp: now.getTime(),
                end_timestamp: now.getTime(),
                ip: micro.ip,
                sensor: micro.sensor,
                username: micro.username,
                measure: micro.measure,
                ...data
            }

            await this.db.savePicture(doc)
        } catch (error) {
            // camera unreachable — skip silently
        }
    }
}

module.exports = PictureScheduler
