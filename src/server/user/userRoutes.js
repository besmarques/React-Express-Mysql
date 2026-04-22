const express = require("express");
const router = express.Router();
const authenticateJWT = require("../config/auth");
const userController = require("./userController");
const userValidation = require("./userValidation");

router.get("/users", authenticateJWT, userController.getUsers);
router.post("/login", userValidation.validateLogin, userController.login);
router.post("/signup", userValidation.validateSignup, userController.signup);
router.post("/forgot-password", userValidation.validateForgotPassword, userController.forgotPassword);
router.post("/reset-password", userValidation.validateResetPassword, userController.resetPassword);
router.post("/logout", authenticateJWT, userController.logout);

module.exports = router;
