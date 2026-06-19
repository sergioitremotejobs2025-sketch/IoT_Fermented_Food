const { isValidMicrocontroller, isValidIpAddress } = require('../src/helpers/helpers')

describe('Helpers logic', () => {
    describe('isValidIpAddress', () => {
        it('should return false for null/undefined/empty', () => {
            expect(isValidIpAddress(null)).toBe(false)
            expect(isValidIpAddress(undefined)).toBe(false)
            expect(isValidIpAddress('')).toBe(false)
        })

        it('should return false for short hostnames', () => {
            expect(isValidIpAddress('a')).toBe(false)
            expect(isValidIpAddress('ab')).toBe(false)
        })

        it('should return false for hostnames with spaces', () => {
            expect(isValidIpAddress('my host')).toBe(false)
        })

        it('should return true for valid hostnames', () => {
            expect(isValidIpAddress('arduino.local')).toBe(true)
        })

        it('should return true for valid IPs', () => {
            expect(isValidIpAddress('192.168.1.1')).toBe(true)
            expect(isValidIpAddress('127.0.0.1:3000')).toBe(true)
        })

        it('should return false for invalid IPs', () => {
            expect(isValidIpAddress('256.0.0.1')).toBe(false)
            expect(isValidIpAddress('1.2.3')).toBe(false)
        })
    })

    describe('isValidMicrocontroller', () => {
        it('should return true for valid payload with spaces in ip (should be trimmed)', () => {
            const payload = {
                ip: '  192.168.1.10  ',
                measure: 'temperature',
                sensor: 'S1',
                username: 'Rocky'
            }
            expect(isValidMicrocontroller(payload)).toBe(true)
        })

        it('should return true for valid payload', () => {
            const payload = {
                ip: '192.168.1.10',
                measure: 'temperature',
                sensor: 'S1',
                username: 'Rocky'
            }
            expect(isValidMicrocontroller(payload)).toBe(true)
        })

        it('should return false if ip is missing', () => {
            expect(isValidMicrocontroller({ measure: 't', sensor: 's', username: 'u' })).toBe(false)
        })

        it('should return false if ip is invalid', () => {
            expect(isValidMicrocontroller({ ip: 'a b', measure: 't', sensor: 's', username: 'u' })).toBe(false)
        })
    })
})
