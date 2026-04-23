const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

const getClientEnv = () => ({
    REACT_APP_BASENAME: process.env.REACT_APP_BASENAME,
    REACT_APP_STATUS_MESSAGE: process.env.REACT_APP_STATUS_MESSAGE,
});

const getAuthStatus = (token) => {
    if (!token) {
        return { isAuthenticated: false };
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        return {
            isAuthenticated: true,
            isAdmin: decoded.isAdmin,
        };
    } catch (err) {
        return { isAuthenticated: false };
    }
};

module.exports = {
    getAuthStatus,
    getClientEnv,
};
