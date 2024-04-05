const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const logger = require('./logger');

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    //logger.info('logged in iniciated')

    if (token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                logger.error(err.name + " - " + err.message);
                return res.status(403).send('Forbidden: Invalid or expired token');
            }

            req.user = user;
            next();
            //logger.info('logged in completed')
        });
    } else {
        logger.error('401 - Unauthorized: No token provided');
        res.status(401).send('Unauthorized: No token provided');
    }
};

module.exports = authenticateJWT;