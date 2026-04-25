const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizePermission } = require("../../config/auth");
const { permissions } = require("../permissions/permissionConstants");
const mediaController = require("./mediaController");
const mediaValidation = require("./mediaValidation");

const router = express.Router();

router.get("/media", authenticateJWT, authorizePermission(permissions.cmsMediaManage), mediaController.getMedia);
router.get("/media/:id", authenticateJWT, authorizePermission(permissions.cmsMediaManage), mediaController.getMediaById);
router.post("/media", authenticateJWT, authorizePermission(permissions.cmsMediaManage), mediaValidation.validateUploadMedia, mediaController.uploadMedia);
router.put("/media/:id", authenticateJWT, authorizePermission(permissions.cmsMediaManage), mediaValidation.validateUpdateMedia, mediaController.updateMedia);
router.delete("/media/:id", authenticateJWT, authorizePermission(permissions.cmsMediaManage), mediaController.deleteMedia);

module.exports = router;
