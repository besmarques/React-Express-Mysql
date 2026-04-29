const jwt = require("jsonwebtoken");
const { isCmsEnabled } = require("../cms/cmsConfig");
const { cmsAccessPermissions } = require("../cms/permissions/permissionConstants");

const secretKey = process.env.JWT_SECRET;

const getClientEnv = () => ({
    CMS_ENABLED: isCmsEnabled(),
    CMS_THEME: process.env.CMS_THEME || "default",
    REACT_APP_BASENAME: process.env.REACT_APP_BASENAME,
    REACT_APP_NAME: process.env.REACT_APP_NAME,
    REACT_APP_STATUS_MESSAGE: process.env.REACT_APP_STATUS_MESSAGE,
});

const getAuthStatus = (token) => {
    if (!token) {
        return { isAuthenticated: false };
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const permissions = Array.isArray(decoded.permissions) ? decoded.permissions : [];
        return {
            canAccessCms: Boolean(decoded.isAdmin) || permissions.some((permission) => cmsAccessPermissions.includes(permission)),
            isAuthenticated: true,
            isAdmin: decoded.isAdmin,
            permissions,
        };
    } catch (err) {
        return { isAuthenticated: false };
    }
};

module.exports = {
    getAuthStatus,
    getClientEnv,
};
