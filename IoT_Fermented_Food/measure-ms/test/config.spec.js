describe('Config fallback', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should use default values if MONGO environment variables are not set', () => {
        delete process.env.MONGO_HOSTNAME;
        delete process.env.MONGO_SERVICE_PORT;
        delete process.env.MONGO_DATABASE_NAME;
        delete process.env.MONGO_INITDB_ROOT_PASSWORD;
        delete process.env.MONGO_INITDB_ROOT_USERNAME;

        const config = require('../src/config/mongodb.config');
        expect(config.MONGO).toBe('192.168.1.222:32000');
        expect(config.DB_NAME).toBe('iot');
        expect(config.PASSWORD).toBe('secret');
        expect(config.USERNAME).toBe('root');
    });

    it('should use environment variables if set', () => {
        process.env.MONGO_HOSTNAME = 'test-host';
        process.env.MONGO_SERVICE_PORT = '27017';
        process.env.MONGO_DATABASE_NAME = 'test-db';
        process.env.MONGO_INITDB_ROOT_PASSWORD = 'test-pass';
        process.env.MONGO_INITDB_ROOT_USERNAME = 'test-user';

        const config = require('../src/config/mongodb.config');
        expect(config.MONGO).toBe('test-host:27017');
        expect(config.DB_NAME).toBe('test-db');
        expect(config.PASSWORD).toBe('test-pass');
        expect(config.USERNAME).toBe('test-user');
    });
});
