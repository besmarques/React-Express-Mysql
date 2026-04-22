const settingsService = require("./settingsService");

const getSettings = (req, res) => {
    res.json(settingsService.getSettings());
};

module.exports = {
    getSettings,
};
