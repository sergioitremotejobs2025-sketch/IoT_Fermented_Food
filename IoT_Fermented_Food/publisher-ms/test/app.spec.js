jest.mock('../src/config/config', () => ({
  PING_TIMEOUT: 1,
  QUEUES_MEASURES: {
    humidity: 'h',
    light: 'l',
    temperature: 't'
  }
}));
jest.mock('amqplib');
const amqplib = require('amqplib');
const { main } = require('../src/app/app')

describe('Publish measures to queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })

  it('should send three measures to queue', async () => {
    await main()
    // It should have called connect and then sent 3 things
    const connection = await amqplib.connect();
    const channel = await connection.createConfirmChannel();

    // Check call count on mock explicitly
    expect(channel.sendToQueue).toHaveBeenCalledTimes(3);
  })
})
