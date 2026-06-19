/**
 * Internal API-key middleware for measure-ms.
 *
 * All callers (currently only orchestrator-ms) must send the shared secret in
 * the `x-internal-api-key` HTTP header.  The secret is configured via the
 * INTERNAL_API_KEY environment variable.  When the variable is absent the
 * middleware raises a startup error so the misconfiguration is caught early.
 *
 * In local / test mode (NODE_ENV=test) the check is skipped entirely so that
 * Jest tests don't need to carry the header.
 */

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

if (!INTERNAL_API_KEY && process.env.NODE_ENV !== 'test') {
    // Emit a clear warning rather than silently accepting all traffic
    console.warn(
        '[measure-ms] WARNING: INTERNAL_API_KEY is not set. ' +
        'All requests to measure-ms data routes will be rejected with 401.'
    )
}

const requireInternalKey = (req, res, next) => {
    // Skip auth in test environment
    if (process.env.NODE_ENV === 'test') return next()

    const provided = req.headers['x-internal-api-key']

    if (!INTERNAL_API_KEY || provided !== INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    next()
}

module.exports = { requireInternalKey }
