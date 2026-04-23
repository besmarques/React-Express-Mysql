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

module.exports = authenticateJWT;
module.exports.authorizeAdmin = authorizeAdmin;
