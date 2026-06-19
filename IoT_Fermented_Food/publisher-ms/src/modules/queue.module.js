const amqp = require('amqplib')
const { PASSWORD, RABBITMQ, USERNAME } = require('../config/config')

const url = `amqp://${USERNAME}:${PASSWORD}@${RABBITMQ}/`

class Queue {
  constructor(queue) {
    this.queueName = queue
    this.connection = null
    this.channel = null
    this.offlinePubQueue = []
    this.connectedPromise = this.connect()
  }

  async isReady() {
    return this.connectedPromise
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

      console.log('[AMQP] connected')
      this.channel = await this.connection.createConfirmChannel()

      // DLQ Configuration to match other services
      const dlx = 'dlx'
      const dlq = 'dead-messages'
      await this.channel.assertExchange(dlx, 'fanout', { durable: true })
      await this.channel.assertQueue(dlq, { durable: true })
      await this.channel.bindQueue(dlq, dlx, '')

      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': dlx
        }
      })


      this.channel.on('error', (err) => {
        console.error('[AMQP] channel error', err.message)
      })
      this.channel.on('close', () => {
        console.log('[AMQP] channel closed')
      })

      // Send pending messages
      while (this.offlinePubQueue.length > 0) {
        const msg = this.offlinePubQueue.shift()
        await this.publish(msg)
      }
      return true
    } catch (error) {
      console.error('[AMQP] connection failed:', error.message)
      return this.reconnect(retryCount)
    }
  }

  reconnect(retryCount = 0) {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
    console.log(`[AMQP] retrying connection in ${delay}ms...`)
    return new Promise(resolve => {
      setTimeout(() => resolve(this.connect(retryCount + 1)), delay)
    })
  }

  async close() {
    // Wait for queue to be empty
    while (this.offlinePubQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (this.channel) await this.channel.close()
    if (this.connection) {
      this.connection.removeAllListeners('close')
      await this.connection.close()
    }
  }

  async publish(message) {
    const content = Buffer.from(JSON.stringify(message))
    try {
      if (!this.channel) {
        console.log('[AMQP] channel not ready, queuing message')
        this.offlinePubQueue.push(message)
        return
      }

      await new Promise((resolve, reject) => {
        this.channel.sendToQueue(this.queueName, content, { persistent: true }, (err, ok) => {
          if (err) {
            console.error('[AMQP] nack/error publishing', err)
            this.offlinePubQueue.push(message)
            reject(err)
          } else {
            resolve(ok)
          }
        })
      })
    } catch (error) {
      console.error('[AMQP] publish error:', error.message)
      this.offlinePubQueue.push(message)
    }
  }
}

module.exports = Queue
