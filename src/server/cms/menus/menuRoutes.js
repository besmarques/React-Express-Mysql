const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizeAdmin } = require("../../config/auth");
const menuController = require("./menuController");
const menuValidation = require("./menuValidation");

const router = express.Router();

router.get("/public/menus/:location", menuController.getPublicMenuByLocation);

router.get("/menus", authenticateJWT, authorizeAdmin, menuController.getMenus);
router.get("/menus/:id", authenticateJWT, authorizeAdmin, menuController.getMenuById);
router.post("/menus", authenticateJWT, authorizeAdmin, menuValidation.validateCreateMenu, menuController.createMenu);
router.put("/menus/:id", authenticateJWT, authorizeAdmin, menuValidation.validateUpdateMenu, menuController.updateMenu);
router.delete("/menus/:id", authenticateJWT, authorizeAdmin, menuController.deleteMenu);

router.get("/menus/:id/items", authenticateJWT, authorizeAdmin, menuController.getMenuItems);
router.post("/menus/:id/items", authenticateJWT, authorizeAdmin, menuValidation.validateCreateMenuItem, menuController.createMenuItem);
router.put("/menus/:id/items/:itemId", authenticateJWT, authorizeAdmin, menuValidation.validateUpdateMenuItem, menuController.updateMenuItem);
router.delete("/menus/:id/items/:itemId", authenticateJWT, authorizeAdmin, menuController.deleteMenuItem);

module.exports = router;
