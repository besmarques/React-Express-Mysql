const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizePermission } = require("../../config/auth");
const { permissions } = require("../permissions/permissionConstants");
const menuController = require("./menuController");
const menuValidation = require("./menuValidation");

const router = express.Router();

router.get("/public/menus/:location", menuController.getPublicMenuByLocation);

router.get("/menus", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuController.getMenus);
router.get("/menus/item-targets", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuController.getMenuItemTargets);
router.get("/menus/:id", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuController.getMenuById);
router.post("/menus", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuValidation.validateCreateMenu, menuController.createMenu);
router.put("/menus/:id", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuValidation.validateUpdateMenu, menuController.updateMenu);
router.delete("/menus/:id", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuController.deleteMenu);

router.get("/menus/:id/items", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuController.getMenuItems);
router.post("/menus/:id/items", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuValidation.validateCreateMenuItem, menuController.createMenuItem);
router.put("/menus/:id/items/:itemId", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuValidation.validateUpdateMenuItem, menuController.updateMenuItem);
router.delete("/menus/:id/items/:itemId", authenticateJWT, authorizePermission(permissions.cmsMenusManage), menuController.deleteMenuItem);

module.exports = router;
