const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const logger = require('./logger');

const sendAuthError = (res, statusCode, code, message) => res.status(statusCode).json({ code, message });

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const user = jwt.verify(token, secretKey);
            req.user = user;
            next();
        } catch (err) {
            logger.warn(err.name + " - " + err.message);
            return sendAuthError(res, 403, 'AUTH_TOKEN_INVALID', 'Your session is invalid or has expired. Please log in again.');
        }
    } else {
        return sendAuthError(res, 401, 'AUTH_TOKEN_MISSING', 'You need to log in to continue.');
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        logger.warn('403 - Forbidden: Admin access required');
        return sendAuthError(res, 403, 'AUTH_ADMIN_REQUIRED', 'You do not have access to this area.');
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
        return sendAuthError(res, 403, 'AUTH_PERMISSION_REQUIRED', 'You do not have permission to perform this action.');
    }

    return next();
};

module.exports = authenticateJWT;
module.exports.authorizeAdmin = authorizeAdmin;
module.exports.authorizePermission = authorizePermission;
