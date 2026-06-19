/**
 * Middleware that requires a valid INTERNAL_API_KEY to be present in the x-internal-api-key header.
 * If the key is not set in the environment, the check is skipped (allowing local development).
 */
const requireInternalKey = (req, res, next) => {
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''
    if (!INTERNAL_API_KEY) {
        return next()
    }

    const requestKey = req.headers['x-internal-api-key']

    if (requestKey !== INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized access' })
    }

    next()
}

module.exports = { requireInternalKey }
