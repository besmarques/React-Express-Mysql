const express = require("express");
const router = express.Router();
const logger = require("../config/logger");
const connections = require("../config/dbpool");
const authenticateJWT = require("../config/auth");
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

router.get("/main-route", (req, res) => {
    // Handle request
    res.send("this is the main route");
});

//route to test the server
router.get("/", authenticateJWT, (req, res) => {
    res.send("Hello World !!!!!");
});

//pass ONLY the enviromental variables needed to the client
router.get("/env", authenticateJWT, (req, res) => {
    res.json({
        //change this to the variables you need
        REACT_APP_BASENAME: process.env.REACT_APP_BASENAME,
        REACT_APP_TESTE: process.env.REACT_APP_TESTE,
    });
});

router.get('/auth-status', (req, res) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                // Token is not valid
                res.json({ isAuthenticated: false });
            } else {
                // Token is valid
                res.json({ isAuthenticated: true });
            }
        });
    } else {
        // No token
        res.json({ isAuthenticated: false });
    }
  });

module.exports = router;
