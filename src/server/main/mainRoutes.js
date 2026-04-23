const express = require("express");
const router = express.Router();
const mainController = require("./mainController");

router.get("/health", mainController.getHealth);
router.get("/env", mainController.getEnv);
router.get("/auth-status", mainController.getAuthStatus);

module.exports = router;
