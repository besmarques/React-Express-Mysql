const express = require("express");
const router = express.Router();

router.get("/main-route", (req, res) => {
    // Handle request
    res.send("this is the main route");
});

//route to test the server
router.get("/", (req, res) => {
    res.send("Hello World !!!!!");
});

//pass ONLY the enviromental variables needed to the client
router.get("/env", (req, res) => {
    res.json({
        //change this to the variables you need
        REACT_APP_BASENAME: process.env.REACT_APP_BASENAME,
        REACT_APP_TESTE: process.env.REACT_APP_TESTE,
    });
});

module.exports = router;
