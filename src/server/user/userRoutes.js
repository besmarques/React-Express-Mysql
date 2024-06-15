const express = require("express");
const router = express.Router();
const logger = require("../config/logger");
const connections = require("../config/dbpool");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const fromEmail = process.env.EMAIL_USERNAME;
const adminEmail = process.env.ADMIN_EMAIL;
const transporter = require('../config/email');
const crypto = require('crypto');
const authenticateJWT = require("../config/auth");

router.get("/users", authenticateJWT, async (req, res) => {
    let sqlQuery = "SELECT * FROM user";

    try {
        const [users] = await connections.execute(sqlQuery);
        logger.info(sqlQuery + " completed succefully");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.errno + " - " + err.code + " - " + err.sqlMessage);
        logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await connections.execute('SELECT * FROM user WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json('No user with that email');
        }

        const user = users[0];

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                logger.error(err);
                return res.status(500).send('Server error');
            }

            if (result) {
                // Passwords match
                // TODO: Start a session or issue a token
                
                //res.send('Logged in');

                const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, secretKey, { expiresIn: '1h' });

                console.log(token)

                res.cookie('token', token, { secure: true, httpOnly: true, sameSite: 'strict' });

                console.log("req session",req.session);
                console.log("user id",user.id);
                console.log("user admin", user.is_admin);

                req.session.userId = user.id;

                // Send the token to the client
                //res.json({ token });

                res.json({ message: 'Logged in'});
            } else {
                // Passwords don't match
                logger.info('401 - Incorrect password');
                res.status(401).json('Incorrect password');
            }
        });
    } catch (err) {
        logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
        res.status(500).send('Server error');
    }
});

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    /*if (email === 'error@test.com') {
        throw new Error('Test error');
    }*/

    try {
        const [users] = await connections.execute('SELECT * FROM user WHERE email = ?', [email]);

        if (users.length > 0) {
            return res.status(400).json('User with that email already exists');
        }

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                logger.error(err);
                return res.status(500).send('Server error');
            }

            try {
                await connections.execute('INSERT INTO user (email, password) VALUES (?, ?)', [email, hashedPassword]);
                res.status(201).json('User created');
            } catch (err) {
                logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
                res.status(500).send('Server error');
            }
        });
    } catch (err) {
        logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
        res.status(500).send('Server error');
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (email === adminEmail) {
        return res.status(400).json({ message: 'Cannot reset password for this user.' });
    } 

    // Generate a random password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Store the token in the database against the user's record
    // This code assumes you have a method to update the user's record with the reset token
    try {
        await connections.execute('UPDATE user SET resetToken = ? WHERE email = ?', [resetToken, email]);
    } catch (err) {
        logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
        return res.status(500).send('Server error');
    }



    let mailOptions = {
        from: fromEmail,
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\nhttp://<your-app-url>/reset-password/${resetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            logger.error(err);
            return res.status(500).send('Server error');
        } else {
            return res.status(200).json({ message: 'Password reset link sent to email.' });
        }
    });
});



router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    // Find the user with the provided reset token
    let user;
    try {
        [user] = await connections.execute('SELECT * FROM user WHERE resetToken = ?', [resetToken]);
    } catch (err) {
        logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
        return res.status(500).send('Server error');
    }

    if (!user) {
        return res.status(400).json({ message: 'Invalid reset token.' });
    }

    // Hash the new password
    const saltRounds = 10;
    bcrypt.hash(newPassword, saltRounds, async (err, hashedPassword) => {
        if (err) {
            logger.error(err);
            return res.status(500).send('Server error');
        }

        // Update the user's password in the database
        try {
            await connections.execute('UPDATE user SET password = ?, resetToken = NULL WHERE resetToken = ?', [hashedPassword, resetToken]);
        } catch (err) {
            logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
            return res.status(500).send('Server error');
        }

        return res.status(200).json({ message: 'Password has been reset.' });
    });
});


router.post('/logout', authenticateJWT, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            // Handle error
            logger.error('Error destroying session:', err);
            return res.status(500).send('Server error');
        }
        // Clear cookies
        res.clearCookie('token');
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
        logger.info('Logged out');
    });
});

module.exports = router;