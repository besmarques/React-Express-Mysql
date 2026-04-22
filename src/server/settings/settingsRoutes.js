const express = require("express");
const router = express.Router();
const settingsController = require("./settingsController");

router.get("/settings", settingsController.getSettings);

module.exports = router;
