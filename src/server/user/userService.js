const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const emailService = require("../config/email");
const userRepository = require("./userRepository");

const secretKey = process.env.JWT_SECRET;
const fromEmail = process.env.EMAIL_USERNAME;
const adminEmail = process.env.ADMIN_EMAIL;
const publicAppUrl = (process.env.APP_PUBLIC_URL || '').replace(/\/+$/, '');
const resetTokenLifetimeMs = 60 * 60 * 1000;

const createHttpError = (statusCode, responseBody, message) => {
    const error = new Error(message || responseBody);
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const getUsers = async () => userRepository.getUsers();
const invalidLoginResponse = "Invalid email or password";

const hashResetToken = (resetToken) => crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

const getResetPasswordUrl = (resetToken) => `${publicAppUrl}/reset-password/${resetToken}`;

const loginUser = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw createHttpError(401, invalidLoginResponse);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw createHttpError(401, invalidLoginResponse);
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, secretKey, { expiresIn: "1h" });

    return {
        token,
        userId: user.id,
    };
};

const signupUser = async (email, password) => {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
        throw createHttpError(400, "User with that email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.createUser(email, hashedPassword);
};

const sendPasswordReset = async (email) => {
    if (email === adminEmail) {
        throw createHttpError(400, { message: "Cannot reset password for this user." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiresAt = new Date(Date.now() + resetTokenLifetimeMs);
    const updateResult = await userRepository.saveResetToken(email, resetTokenHash, resetTokenExpiresAt);

    if (!updateResult || updateResult.affectedRows === 0) {
        return;
    }

    const mailOptions = {
        from: fromEmail,
        to: email,
        subject: "Password Reset",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n${getResetPasswordUrl(resetToken)}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await emailService.sendMail(mailOptions);
};

const resetPassword = async (resetToken, newPassword) => {
    const resetTokenHash = hashResetToken(resetToken);
    const user = await userRepository.findByResetToken(resetTokenHash);

    if (!user) {
        throw createHttpError(400, { message: "Invalid or expired reset token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateResult = await userRepository.updatePasswordByResetToken(user.id, resetTokenHash, hashedPassword);

    if (!updateResult || updateResult.affectedRows === 0) {
        throw createHttpError(400, { message: "Invalid or expired reset token." });
    }
};

module.exports = {
    getUsers,
    loginUser,
    resetPassword,
    sendPasswordReset,
    signupUser,
};
