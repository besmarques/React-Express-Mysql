// mailConfig.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.freesmtpservers.com',
    port: 25,
    secure: false, // true for 465, false for other ports
});

module.exports = transporter;



    // Send the reset token to the user's email address
    /*let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });*/