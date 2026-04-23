const mainService = require("./mainService");

const getHealth = (req, res) => {
    res.json({ status: "ok" });
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
    getHealth,
};
