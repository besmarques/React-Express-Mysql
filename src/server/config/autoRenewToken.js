const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const { tokenCookieOptions } = require("./cookieOptions");

const publicApiPaths = new Set([
    '/api/auth-status',
    '/api/forgot-password',
    '/api/login',
    '/api/reset-password',
    '/api/settings',
    '/api/signup',
]);

const isPublicApiPath = (path) => (
    publicApiPaths.has(path) || path.startsWith('/api/cms/public/')
);

const autoRenewToken = (req, res, next) => {
    if (!req.path.startsWith('/api') || req.path === '/api/logout') {
        return next();
    }

    const token = req.cookies.token;
    const isPublicPath = isPublicApiPath(req.path);

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                if (isPublicPath) {
                    res.clearCookie('token', tokenCookieOptions);
                    return next();
                }

                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }

            const currentTime = Date.now().valueOf() / 1000;
            if (decoded.exp < currentTime + 15 * 60) {
                const newToken = jwt.sign({ id: decoded.id, isAdmin: decoded.isAdmin }, secretKey, { expiresIn: '1h' });
                res.cookie('token', newToken, tokenCookieOptions);
            }
            next();
        });
    } else {
        next();
    }
};

module.exports = autoRenewToken;
