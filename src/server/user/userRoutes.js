const express = require("express");
const router = express.Router();
const authenticateJWT = require("../config/auth");
const { authorizePermission } = require("../config/auth");
const { permissions } = require("../cms/permissions/permissionConstants");
const userController = require("./userController");
const userValidation = require("./userValidation");

router.get("/users", authenticateJWT, authorizePermission(permissions.usersManage), userController.getUsers);
router.post("/login", userValidation.validateLogin, userController.login);
router.post("/signup", userValidation.validateSignup, userController.signup);
router.post("/forgot-password", userValidation.validateForgotPassword, userController.forgotPassword);
router.post("/reset-password", userValidation.validateResetPassword, userController.resetPassword);
router.post("/logout", userController.logout);

module.exports = router;
