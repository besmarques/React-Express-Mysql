const logger = require("../config/logger");
const { sessionClearCookieOptions, tokenCookieOptions } = require("../config/cookieOptions");
const userService = require("./userService");

const logServerError = (err) => {
    if (err.errno || err.code || err.sqlMessage) {
        logger.error(`${err.errno} - ${err.code} - ${err.sqlMessage}`);
        return;
    }

    logger.error(err);
};

const sendError = (res, err) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json(err.responseBody);
    }

    logServerError(err);
    return res.status(500).send("Server error");
};

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        logger.info("Get users completed successfully");
        return res.json(users);
    } catch (err) {
        return sendError(res, err);
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { token, userId } = await userService.loginUser(email, password);

        res.cookie("token", token, tokenCookieOptions);
        req.session.userId = userId;
        logger.info("User login succeeded");

        return res.json({ message: "Logged in" });
    } catch (err) {
        return sendError(res, err);
    }
};

const signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        await userService.signupUser(email, password);
        return res.status(201).json("User created");
    } catch (err) {
        return sendError(res, err);
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        await userService.sendPasswordReset(email);
        return res.status(200).json({ message: "Password reset link sent to email." });
    } catch (err) {
        return sendError(res, err);
    }
};

const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        await userService.resetPassword(resetToken, newPassword);
        return res.status(200).json({ message: "Password has been reset." });
    } catch (err) {
        return sendError(res, err);
    }
};

const clearAuthCookies = (res) => {
    res.clearCookie("token", tokenCookieOptions);
    res.clearCookie("connect.sid", sessionClearCookieOptions);
};

const logout = (req, res) => {
    const sendLoggedOut = () => {
        clearAuthCookies(res);
        res.json({ message: "Logged out" });
        logger.info("Logged out");
    };

    if (!req.session || typeof req.session.destroy !== "function") {
        return sendLoggedOut();
    }

    req.session.destroy((err) => {
        if (err) {
            logger.error("Error destroying session:", err);
            return res.status(500).send("Server error");
        }

        return sendLoggedOut();
    });
};

module.exports = {
    forgotPassword,
    getUsers,
    login,
    logout,
    resetPassword,
    signup,
};
