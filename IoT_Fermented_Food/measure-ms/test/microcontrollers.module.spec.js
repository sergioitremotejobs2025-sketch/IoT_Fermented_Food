const axios = require('axios')
jest.mock('axios', () => ({
    get: jest.fn()
}))

describe('MicrocontrollersModule', () => {
    let originalEnv

    beforeEach(() => {
        originalEnv = { ...process.env }
        jest.clearAllMocks()
    })

    afterEach(() => {
        process.env = originalEnv
    })

    it('digitalToReal covers moisture sensor', () => {
        const MicrocontrollersModule = require('../src/modules/microcontrollers.module')
        const mm = new MicrocontrollersModule('humidity')
        const val = mm.digitalToReal(500, 'Grove - Moisture')
        expect(val).toBe(52.6)
    })

    it('digitalToReal covers temperature sensor', () => {
        const MicrocontrollersModule = require('../src/modules/microcontrollers.module')
        const mm = new MicrocontrollersModule('temperature')
        const val = mm.digitalToReal(500, 'Grove - Temperature')
        expect(val).toBe(24.1)
    })

    it('getMicrocontrollers sends no headers if INTERNAL_API_KEY is missing', async () => {
        delete process.env.INTERNAL_API_KEY
        // We need to re-require to pick up the env change
        jest.isolateModules(async () => {
            const MicrocontrollersModule = require('../src/modules/microcontrollers.module')
            const mm = new MicrocontrollersModule('humidity')
            axios.get.mockResolvedValue({ data: ['mcu1'] })

            const res = await mm.getMicrocontrollers()
            expect(res).toEqual(['mcu1'])
            expect(axios.get).toHaveBeenCalledWith(expect.any(String), { headers: {} })
        })
    })

    it('getMicrocontrollers sends headers if INTERNAL_API_KEY is present', async () => {
        process.env.INTERNAL_API_KEY = 'secret'
        jest.isolateModules(async () => {
            const MicrocontrollersModule = require('../src/modules/microcontrollers.module')
            const mm = new MicrocontrollersModule('humidity')
            axios.get.mockResolvedValue({ data: ['mcu1'] })

            const res = await mm.getMicrocontrollers()
            expect(res).toEqual(['mcu1'])
            expect(axios.get).toHaveBeenCalledWith(expect.any(String), { headers: { 'x-internal-api-key': 'secret' } })
        })
    })
})
