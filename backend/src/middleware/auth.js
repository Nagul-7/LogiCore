const jwt = require('jsonwebtoken');

/**
 * requireAuth — validates Bearer JWT, attaches decoded payload to req.user
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized: Token expired' });
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

// Legacy stubs kept for backward compat (no-op in dev)
const authenticate = requireAuth;
const authorize = (..._roles) => (_req, _res, next) => next();

module.exports = { requireAuth, authenticate, authorize };
