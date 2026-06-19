const {
  AUTH_MS,
  MEASURE_MS,
  MICROCONTROLLERS_MS,
  AI_MS
} = require('../src/config/services.config')

const mockAxios = {
  delete: jest.fn((url = '') => {
    if (url.includes(`${MICROCONTROLLERS_MS}`)) {
      return Promise.resolve({ data: 'OK' })
    }
    return Promise.resolve({ data: {} })
  }),
  get: jest.fn((url = '') => {
    if (url.includes(`${MICROCONTROLLERS_MS}`)) {
      return Promise.resolve({ data: require('../test/microcontrollers.json') })
    } else if (url.includes(`${MEASURE_MS}`)) {
      if (url.includes('pictures')) {
        return Promise.resolve({ data: require('../test/pictures.json') || [] })
      }
      return Promise.resolve({
        data: url.includes('temperatures') ? require('../test/temperature-stats.json') : require('../test/temperature.json')
      })
    }
    return Promise.resolve({ data: {} })
  }),
  post: jest.fn((url = '', body = {}) => {
    if (url.includes(`${AUTH_MS}/login`)) {
      return Promise.resolve({ data: String(!!(body.username === 'Rocky' && (body.password || body.password === '') && body.refreshToken)) })
    } else if (url.includes(`${AUTH_MS}/register`)) {
      return Promise.resolve({ data: String(!!(body.username !== 'Rocky' && (body.password || body.password === '') && body.refreshToken)) })
    } else if (url.includes(`${AUTH_MS}/refresh`)) {
      return Promise.resolve({ data: !!(body.username === 'Rocky' && body.newRefreshToken && body.refreshToken) })
    } else if (url.includes(`${MICROCONTROLLERS_MS}`)) {
      return Promise.resolve({ data: body })
    } else if (url.includes(`${MEASURE_MS}`)) {
      return Promise.resolve({ data: body })
    } else if (url.includes(`${AI_MS}`)) {
      return Promise.resolve({ data: 'AI Response' })
    }
    return Promise.resolve({ data: {} })
  }),
  put: jest.fn((url = '', body = {}) => {
    if (url.includes(`${MICROCONTROLLERS_MS}`)) {
      return Promise.resolve({ data: body })
    } else if (url.includes(`${AUTH_MS}/change-password`)) {
      return Promise.resolve({ data: 'true' })
    }
    return Promise.resolve({ data: {} })
  })
}

module.exports = mockAxios
