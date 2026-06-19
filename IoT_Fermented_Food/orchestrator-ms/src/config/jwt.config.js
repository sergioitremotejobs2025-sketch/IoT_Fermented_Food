module.exports = {
  MAX_EXPIRATION_TIME: 2592000, // 30 days in seconds
  REFRESH_TOKEN_LENGTH: 256,
  TOKEN_EXPIRATION_TIME: 3600, // 1 hour in seconds
  TOKEN_SECRET: process.env.JWT_SECRET || 'token_secret'
}
