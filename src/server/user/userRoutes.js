const express = require("express");
const router = express.Router();
const logger = require("../config/logger");
const connections = require("../config/dbpool");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

router.get("/users", async (req, res) => {
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
            return res.status(400).send('No user with that email');
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

                const token = jwt.sign({ id: user.id }, 'your-secret-key', { expiresIn: '24h' });

                // Send the token to the client
                res.json({ token });
            } else {
                // Passwords don't match
                res.status(401).send('Incorrect password');
            }
        });
    } catch (err) {
        logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
        res.status(500).send('Server error');
    }
});

module.exports = router;