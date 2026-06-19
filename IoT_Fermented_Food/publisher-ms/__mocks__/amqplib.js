let sentCount = 0;

const mockChannel = {
    assertQueue: jest.fn().mockResolvedValue({}),
    assertExchange: jest.fn().mockResolvedValue({}),
    bindQueue: jest.fn().mockResolvedValue({}),
    sendToQueue: jest.fn((q, c, o, cb) => {
        if (cb) cb(null, true);
        return true;
    }),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue({}),
};

const mockConnection = {
    createConfirmChannel: jest.fn().mockResolvedValue(mockChannel),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue({}),
};

// Instead of manually tracking, let's just use jest's built in tracking.
// But we'll leave amqplib.js alone and export this properly.
module.exports = {
    connect: jest.fn().mockResolvedValue(mockConnection)
};
