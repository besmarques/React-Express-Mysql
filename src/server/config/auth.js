const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const logger = require('./logger');

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const user = jwt.verify(token, secretKey);
            req.user = user;
            next();
        } catch (err) {
            logger.warn(err.name + " - " + err.message);
            return res.status(403).send('Forbidden: Invalid or expired token');
        }
    } else {
        res.status(401).send('Unauthorized: No token provided');
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        logger.warn('403 - Forbidden: Admin access required');
        return res.status(403).send('Forbidden: Admin access required');
    }

    return next();
};

const hasPermission = (req, permission) => (
    Boolean(req.user && req.user.isAdmin)
        || Boolean(req.user && Array.isArray(req.user.permissions) && req.user.permissions.includes(permission))
);

const authorizePermission = (permission) => (req, res, next) => {
    if (!hasPermission(req, permission)) {
        logger.warn(`403 - Forbidden: Permission required (${permission})`);
        return res.status(403).send("Forbidden: Insufficient permissions");
    }

    return next();
};

module.exports = authenticateJWT;
module.exports.authorizeAdmin = authorizeAdmin;
module.exports.authorizePermission = authorizePermission;
