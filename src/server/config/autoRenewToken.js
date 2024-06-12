const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

const autoRenewToken = (req, res, next) => {
    // Skip token renewal for the login route
    if (!req.path.startsWith('/api') || req.path === '/api/logout') {
        return next();
    }

    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            } else {
                // Check if token will expire in the next 15 minutes
                const currentTime = Date.now().valueOf() / 1000;
                if (decoded.exp < currentTime + 15 * 60) {
                    // If so, renew the token
                    const newToken = jwt.sign({ id: decoded.id }, secretKey, { expiresIn: '1h' });
                    res.cookie('token', `Bearer ${newToken}`, { secure: true, httpOnly: true, sameSite: 'strict' });
                }
                next();
            }
        });
    } else {
        next();
    }
};

module.exports = autoRenewToken;