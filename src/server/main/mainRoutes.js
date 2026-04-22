const express = require("express");
const router = express.Router();
const authenticateJWT = require("../config/auth");
const mainController = require("./mainController");

router.get("/main-route", mainController.getMainRoute);
router.get("/", authenticateJWT, mainController.getRoot);
router.get("/env", authenticateJWT, mainController.getEnv);
router.get("/auth-status", mainController.getAuthStatus);

module.exports = router;
