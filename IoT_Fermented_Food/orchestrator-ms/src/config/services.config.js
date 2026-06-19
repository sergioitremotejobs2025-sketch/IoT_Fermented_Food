const AUTH_MS_HOST = process.env.AUTH_MS_HOSTNAME || 'localhost'
const AUTH_MS_PORT = process.env.AUTH_MS_SERVICE_PORT || 5000
const MEASURE_MS_HOST = process.env.MEASURE_MS_HOSTNAME || 'localhost'
const MEASURE_MS_PORT = process.env.MEASURE_MS_SERVICE_PORT || 4000
const MICROCONTROLLERS_MS_HOST = process.env.MICROCONTROLLERS_MS_HOSTNAME || 'localhost'
const MICROCONTROLLERS_MS_PORT = process.env.MICROCONTROLLERS_MS_SERVICE_PORT || 6000
const AI_MS_HOST = process.env.AI_MS_HOSTNAME || 'ai-ms'
const AI_MS_PORT = process.env.AI_MS_SERVICE_PORT || 5000

const RABBITMQ_HOST = process.env.RABBITMQ_HOSTNAME || 'localhost'
const RABBITMQ_PORT = process.env.RABBITMQ_SERVICE_PORT || 5672

module.exports = {
  AUTH_MS: `${AUTH_MS_HOST}:${AUTH_MS_PORT}`,
  MEASURE_MS: `${MEASURE_MS_HOST}:${MEASURE_MS_PORT}`,
  MICROCONTROLLERS_MS: `${MICROCONTROLLERS_MS_HOST}:${MICROCONTROLLERS_MS_PORT}`,
  AI_MS: `${AI_MS_HOST}:${AI_MS_PORT}`,
  RABBITMQ: `${RABBITMQ_HOST}:${RABBITMQ_PORT}`,
  RABBITMQ_USER: process.env.RABBITMQ_DEFAULT_USER || 'user',
  RABBITMQ_PASS: process.env.RABBITMQ_DEFAULT_PASS || 'password',
  QUEUES_MEASURES: {
    humidity: process.env.QUEUE_HUMIDITY_NAME || 'humidities',
    light: process.env.QUEUE_LIGHT_NAME || 'lights',
    temperature: process.env.QUEUE_TEMPERATURE_NAME || 'temperatures'
  },
  DEFAULT_TIMEOUT: 10000, // 10s
  AI_TRAIN_TIMEOUT: 60000 // 60s
}

