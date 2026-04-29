const logger = require("../config/logger");
const { sendControllerError } = require("../config/errorResponses");
const { sessionClearCookieOptions, tokenCookieOptions } = require("../config/cookieOptions");
const userService = require("./userService");

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        logger.info("Get users completed successfully");
        return res.json(users);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "USER_LIST_FAILED",
            message: "Unable to load users right now.",
        });
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
        return sendControllerError(res, logger, err, {
            code: "LOGIN_FAILED",
            message: "Unable to log in right now.",
        });
    }
};

const signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        await userService.signupUser(email, password);
        return res.status(201).json({ message: "User created" });
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "SIGNUP_FAILED",
            message: "Unable to create this account right now.",
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        await userService.sendPasswordReset(email);
        return res.status(200).json({ message: "Password reset link sent to email." });
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "PASSWORD_RESET_REQUEST_FAILED",
            message: "Unable to send a password reset link right now.",
        });
    }
};

const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        await userService.resetPassword(resetToken, newPassword);
        return res.status(200).json({ message: "Password has been reset." });
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "PASSWORD_RESET_FAILED",
            message: "Unable to reset the password right now.",
        });
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
            return sendControllerError(res, logger, err, {
                code: "LOGOUT_FAILED",
                message: "Unable to log out right now.",
            });
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
