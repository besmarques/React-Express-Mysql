const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../config/email");
const userRepository = require("./userRepository");

const secretKey = process.env.JWT_SECRET;
const fromEmail = process.env.EMAIL_USERNAME;
const adminEmail = process.env.ADMIN_EMAIL;

const createHttpError = (statusCode, responseBody, message) => {
    const error = new Error(message || responseBody);
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const getUsers = async () => userRepository.getUsers();

const loginUser = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw createHttpError(401, "No user with that email");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw createHttpError(401, "Incorrect password");
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

    const resetToken = crypto.randomBytes(20).toString("hex");
    await userRepository.saveResetToken(email, resetToken);

    const mailOptions = {
        from: fromEmail,
        to: email,
        subject: "Password Reset",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\nhttp://<your-app-url>/reset-password/${resetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
};

const resetPassword = async (resetToken, newPassword) => {
    const user = await userRepository.findByResetToken(resetToken);

    if (!user) {
        throw createHttpError(400, { message: "Invalid reset token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePasswordByResetToken(resetToken, hashedPassword);
};

module.exports = {
    getUsers,
    loginUser,
    resetPassword,
    sendPasswordReset,
    signupUser,
};
