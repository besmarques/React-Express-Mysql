const nodemailer = require('nodemailer');

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === '') {
        return fallback;
    }

    return value.toLowerCase() === 'true';
};

const auth = process.env.EMAIL_PASSWORD
    ? {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    }
    : undefined;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: parseBoolean(process.env.SMTP_SECURE),
    auth,
});

module.exports = transporter;
