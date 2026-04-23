const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizeAdmin } = require("../../config/auth");
const mediaController = require("./mediaController");
const mediaValidation = require("./mediaValidation");

const router = express.Router();

router.get("/media", authenticateJWT, authorizeAdmin, mediaController.getMedia);
router.get("/media/:id", authenticateJWT, authorizeAdmin, mediaController.getMediaById);
router.post("/media", authenticateJWT, authorizeAdmin, mediaValidation.validateUploadMedia, mediaController.uploadMedia);
router.put("/media/:id", authenticateJWT, authorizeAdmin, mediaValidation.validateUpdateMedia, mediaController.updateMedia);
router.delete("/media/:id", authenticateJWT, authorizeAdmin, mediaController.deleteMedia);

module.exports = router;
