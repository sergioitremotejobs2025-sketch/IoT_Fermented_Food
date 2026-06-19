/**
 * TDD: PictureScheduler unit tests
 * Uses Jest fake timers — no real 10h waits.
 */

const PictureScheduler = require('../src/app/schedulers/picture.scheduler')
const { TEN_HOURS_MS } = require('../src/app/constants/constants')

// Flush ALL pending promises (multiple async hops in the capture chain)
const flushPromises = () => new Promise(resolve => setImmediate(resolve))

// Minimal stubs
const makeMicro = () => ({
    ip: '192.168.1.50',
    measure: 'pictures',
    sensor: 'Tomato Plant Camera',
    username: 'Rocky'
})

const makeMicrosModule = (micros = [makeMicro()]) => ({
    getMicrocontrollers: jest.fn().mockResolvedValue(micros)
})

const makeDb = () => ({
    savePicture: jest.fn().mockResolvedValue({})
})

// Minimal axios mock inline (picture response)
jest.mock('axios', () => ({
    get: jest.fn().mockResolvedValue({
        data: {
            pictures: 5,
            stage: 'ripe_fruit',
            stage_id: 5,
            elapsed_minutes: '120.5',
            image_url: 'http://localhost:3005/images/stage_5.png'
        }
    })
}))

describe('PictureScheduler', () => {
    let scheduler, db, microsModule

    beforeEach(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
        db = makeDb()
        microsModule = makeMicrosModule()
        scheduler = new PictureScheduler(db, microsModule)
    })

    afterEach(() => {
        scheduler.stop()
        jest.useRealTimers()
        jest.clearAllMocks()
    })

    it('calls capture() immediately on start()', async () => {
        scheduler.start()
        await flushPromises()
        expect(db.savePicture).toHaveBeenCalledTimes(1)
    })

    it('calls capture() a second time after TEN_HOURS_MS', async () => {
        scheduler.start()
        await flushPromises()
        expect(db.savePicture).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(TEN_HOURS_MS)
        await flushPromises()
        expect(db.savePicture).toHaveBeenCalledTimes(2)
    })

    it('does NOT fire a second time before TEN_HOURS_MS elapses', async () => {
        scheduler.start()
        await flushPromises()
        jest.advanceTimersByTime(TEN_HOURS_MS - 1)
        await flushPromises()
        expect(db.savePicture).toHaveBeenCalledTimes(1)
    })

    it('stop() prevents further captures after interval', async () => {
        scheduler.start()
        await flushPromises()
        scheduler.stop()

        jest.advanceTimersByTime(TEN_HOURS_MS * 3)
        await flushPromises()
        expect(db.savePicture).toHaveBeenCalledTimes(1) // only the initial call
    })

    it('saves picture data with correct fields', async () => {
        scheduler.start()
        await flushPromises()

        const saved = db.savePicture.mock.calls[0][0]
        expect(saved).toEqual(expect.objectContaining({
            ip: '192.168.1.50',
            sensor: 'Tomato Plant Camera',
            username: 'Rocky',
            measure: 'pictures',
            stage: 'ripe_fruit',
            stage_id: 5,
            image_url: 'http://localhost:3005/images/stage_5.png',
            date: expect.any(String),
            timestamp: expect.any(Number)
        }))
    })

    it('skips save and does not throw when camera is unreachable', async () => {
        const axios = require('axios')
        axios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'))

        scheduler.start()
        await flushPromises()
        expect(db.savePicture).not.toHaveBeenCalled()
    })

    it('uses TEN_HOURS_MS as default interval', () => {
        expect(TEN_HOURS_MS).toBe(10 * 60 * 60 * 1000)
    })

    it('logs error when microcontrollers module fails during capture', async () => {
        microsModule.getMicrocontrollers.mockRejectedValueOnce(new Error('Module Failure'))
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        await scheduler.capture()
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[PictureScheduler] capture error:'), 'Module Failure')
        consoleSpy.mockRestore()
    })
})
