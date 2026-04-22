const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const sendValidationError = (res, errors) => (
    res.status(400).json({
        message: "Validation failed",
        errors,
    })
);

const validateEmail = (email, errors) => {
    if (!isNonEmptyString(email)) {
        errors.push({ field: "email", message: "Email is required" });
        return;
    }

    if (!emailPattern.test(email)) {
        errors.push({ field: "email", message: "Email must be valid" });
    }
};

const validatePassword = (password, field, errors) => {
    if (!isNonEmptyString(password)) {
        errors.push({ field, message: "Password is required" });
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

const validateSignup = validateLogin;

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
    validatePassword(req.body.newPassword, "newPassword", errors);

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
