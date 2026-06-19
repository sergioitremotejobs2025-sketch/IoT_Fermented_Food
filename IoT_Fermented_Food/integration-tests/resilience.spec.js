const amqp = require('amqplib');
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://user:password@localhost:35672';

describe('Resilience & DLQ Integration Tests', () => {
    let connection;
    let channel;

    beforeAll(async () => {
        let attempts = 0;
        while (attempts < 15) {
            try {
                connection = await amqp.connect(RABBIT_URL);
                channel = await connection.createChannel();
                console.log('Connected to RabbitMQ for resilience tests');
                break;
            } catch (err) {
                attempts++;
                console.log(`RabbitMQ not ready yet (attempt ${attempts})...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    });

    afterAll(async () => {
        if (channel) await channel.close();
        if (connection) await connection.close();
    });

    it('should move malformed messages to the dead-letter-queue', async () => {
        const dlqName = 'dead-messages';
        const poisonMessage = "MALFORMED_JSON_STRING";

        // Ensure main queue and DLX/DLQ are configured (idempotent)
        await channel.assertExchange('dlx', 'fanout', { durable: true });
        await channel.assertQueue(dlqName, { durable: true });
        await channel.bindQueue(dlqName, 'dlx', '');

        await channel.assertQueue('humidities', {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'dlx'
            }
        });

        channel.sendToQueue('humidities', Buffer.from(poisonMessage));

        console.log('Published poison message, waiting for DLQ routing...');
        await new Promise(r => setTimeout(r, 5000));

        // Step 3: Check if DLQ exists and received the message
        const status = await channel.checkQueue(dlqName);
        expect(status.messageCount).toBeGreaterThanOrEqual(1);
        console.log(`Verified: DLQ ${dlqName} has ${status.messageCount} messages.`);
    }, 20000);
});
