const nodemailer = require('nodemailer');

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === '') {
        return fallback;
    }

    return value.toLowerCase() === 'true';
};

const createEmailConfigError = () => {
    const error = new Error("Email service is not configured");
    error.statusCode = 503;
    error.responseBody = { message: "Email service is not configured." };
    return error;
};

const isEmailConfigured = () => Boolean(
    process.env.EMAIL_USERNAME
    && process.env.EMAIL_PASSWORD
    && process.env.SMTP_HOST
    && process.env.SMTP_PORT
);

const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: parseBoolean(process.env.SMTP_SECURE),
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendMail = async (mailOptions) => {
    if (!isEmailConfigured()) {
        throw createEmailConfigError();
    }

    return createTransporter().sendMail(mailOptions);
};

module.exports = {
    isEmailConfigured,
    sendMail,
};
