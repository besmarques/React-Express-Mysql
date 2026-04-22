const mainService = require("./mainService");

const getMainRoute = (req, res) => {
    res.send("this is the main route");
};

const getRoot = (req, res) => {
    res.send("Hello World !!!!!");
};

const getEnv = (req, res) => {
    res.json(mainService.getClientEnv());
};

const getAuthStatus = (req, res) => {
    res.json(mainService.getAuthStatus(req.cookies.token));
};

module.exports = {
    getAuthStatus,
    getEnv,
    getMainRoute,
    getRoot,
};
