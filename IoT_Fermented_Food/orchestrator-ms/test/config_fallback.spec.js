describe('Config fallback', () => {
    it('should use default token secret if JWT_SECRET is not set', () => {
        const originalSecret = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;
        // Need to bypass require cache
        jest.resetModules();
        const config = require('../src/config/jwt.config');
        expect(config.TOKEN_SECRET).toBe('token_secret');
        process.env.JWT_SECRET = originalSecret;
    });
});
