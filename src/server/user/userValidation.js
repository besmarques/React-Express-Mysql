const { sendValidationError } = require("../config/errorResponses");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPolicy = {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    message: "Password must be at least 8 characters and include uppercase, lowercase, and number characters",
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const validateEmail = (email, errors) => {
    if (!isNonEmptyString(email)) {
        errors.push({ field: "email", message: "Email is required" });
        return;
    }

    if (!emailPattern.test(email)) {
        errors.push({ field: "email", message: "Email must be valid" });
    }
};

const validatePassword = (password, field, errors, { enforcePolicy = false } = {}) => {
    if (!isNonEmptyString(password)) {
        errors.push({ field, message: "Password is required" });
        return;
    }

    if (enforcePolicy && (password.length < passwordPolicy.minLength || !passwordPolicy.pattern.test(password))) {
        errors.push({ field, message: passwordPolicy.message });
    }
};

const validateResetToken = (resetToken, errors) => {
    if (!isNonEmptyString(resetToken)) {
        errors.push({ field: "resetToken", message: "Reset token is required" });
    }
};

const validateLogin = (req, res, next) => {
    const errors = [];

    validateEmail(req.body.email, errors);
    validatePassword(req.body.password, "password", errors);

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

const validateSignup = (req, res, next) => {
    const errors = [];

    validateEmail(req.body.email, errors);
    validatePassword(req.body.password, "password", errors, { enforcePolicy: true });

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

const validateForgotPassword = (req, res, next) => {
    const errors = [];

    validateEmail(req.body.email, errors);

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

const validateResetPassword = (req, res, next) => {
    const errors = [];

    validateResetToken(req.body.resetToken, errors);
    validatePassword(req.body.newPassword, "newPassword", errors, { enforcePolicy: true });

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

module.exports = {
    validateForgotPassword,
    validateLogin,
    validateResetPassword,
    validateSignup,
};
