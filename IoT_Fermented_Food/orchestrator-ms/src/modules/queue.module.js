const amqp = require('amqplib')
const { RABBITMQ, RABBITMQ_USER, RABBITMQ_PASS } = require('../config/services.config')

const url = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ}/`

class QueueManager {
    constructor(io) {
        this.io = io
        this.connection = null
        this.channel = null
        this.queues = ['humidities', 'lights', 'temperatures']
        this.connect()
    }

    async connect(retryCount = 0) {
        try {
            this.connection = await amqp.connect(`${url}?heartbeat=60`)
            this.connection.on('error', (err) => {
                if (err.message !== 'Connection closing') {
                    console.error('[AMQP] connection error', err.message)
                }
            })
            this.connection.on('close', () => {
                console.error('[AMQP] connection closed, reconnecting...')
                this.reconnect()
            })

            console.log('[AMQP] connected to RabbitMQ for live streaming')
            this.channel = await this.connection.createChannel()

            // DLQ Configuration
            const dlx = 'dlx'
            const dlq = 'dead-messages'
            await this.channel.assertExchange(dlx, 'fanout', { durable: true })
            await this.channel.assertQueue(dlq, { durable: true })
            await this.channel.bindQueue(dlq, dlx, '')

            for (const queueName of this.queues) {
                await this.channel.assertQueue(queueName, {
                    durable: true,
                    arguments: {
                        'x-dead-letter-exchange': dlx
                    }
                })
                this.channel.consume(queueName, (msg) => {
                    if (msg !== null) {
                        try {
                            const data = JSON.parse(msg.content.toString())
                            const measureType = queueName === 'humidities' ? 'humidity' :
                                queueName === 'lights' ? 'light' : 'temperature'

                            console.log(`[AMQP] Received ${measureType} update, emitting via WebSocket`)
                            this.io.emit('measure_update', {
                                measure: measureType,
                                data: data
                            })

                            this.channel.ack(msg)
                        } catch (err) {
                            console.error(`[AMQP] Failed to process message from ${queueName}:`, err.message)
                            // Nack without requeue moves to DLX
                            this.channel.nack(msg, false, false)
                        }
                    }
                })
            }

        } catch (error) {
            console.error('[AMQP] connection failed:', error.message)
            this.reconnect(retryCount)
        }
    }

    reconnect(retryCount = 0) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
        setTimeout(() => this.connect(retryCount + 1), delay)
    }
}

module.exports = QueueManager
