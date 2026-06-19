const JwtModule = require('../src/modules/jwt.module');
const jwt = require('jsonwebtoken');

describe('JwtModule', () => {
    let jwtModule;
    let TOKEN_SECRET;
    let REFRESH_TOKEN_LENGTH;
    let MAX_EXPIRATION_TIME;

    beforeEach(() => {
        jest.resetModules();
        process.env.JWT_SECRET = 'test-secret';
        const JwtModule = require('../src/modules/jwt.module');
        const config = require('../src/config/jwt.config');
        TOKEN_SECRET = config.TOKEN_SECRET;
        REFRESH_TOKEN_LENGTH = config.REFRESH_TOKEN_LENGTH;
        MAX_EXPIRATION_TIME = config.MAX_EXPIRATION_TIME;
        jwtModule = new JwtModule();
    });

    it('should generate a refresh token of correct length', () => {
        const token = jwtModule.generateRefreshToken();
        expect(token).toHaveLength(REFRESH_TOKEN_LENGTH);
    });

    it('should generate a valid JWT token', () => {
        const payload = { username: 'testuser' };
        const token = jwtModule.generateToken(payload);
        const decoded = jwt.verify(token, TOKEN_SECRET);
        expect(decoded).toMatchObject(payload);
    });

    it('should use default secret if env is missing', () => {
        delete process.env.JWT_SECRET;
        jest.resetModules();
        const config = require('../src/config/jwt.config');
        expect(config.TOKEN_SECRET).toBe('token_secret');
    });

    it('should get payload from token', () => {
        const payload = { username: 'testuser' };
        const token = jwt.sign(payload, TOKEN_SECRET);
        const decoded = jwtModule.getPayload(token);
        expect(decoded).toMatchObject(payload);
    });

    it('should return empty object if no token provided to getPayload', () => {
        expect(jwtModule.getPayload(null)).toEqual({});
    });

    it('should extract token from headers', () => {
        const headers = { authorization: 'Bearer my-token' };
        expect(jwtModule.getTokenFromHeaders(headers)).toBe('my-token');
    });

    it('should return empty string if no authorization header', () => {
        expect(jwtModule.getTokenFromHeaders({})).toBe('');
    });

    it('should return true for isRefreshable if token is within time limit', () => {
        const now = Math.floor(Date.now() / 1000);
        const iat = now - (MAX_EXPIRATION_TIME / 2);
        const token = jwt.sign({ username: 'test', iat }, TOKEN_SECRET);
        expect(jwtModule.isRefreshable(token)).toBe(true);
    });

    it('should return false for isRefreshable if token is past time limit', () => {
        const now = Math.floor(Date.now() / 1000);
        const iat = now - (MAX_EXPIRATION_TIME + 60);
        const token = jwt.sign({ username: 'test', iat }, TOKEN_SECRET);
        expect(jwtModule.isRefreshable(token)).toBe(false);
    });
});
