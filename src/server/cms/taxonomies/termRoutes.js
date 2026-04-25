const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizePermission } = require("../../config/auth");
const { permissions } = require("../permissions/permissionConstants");
const termController = require("./termController");
const termValidation = require("./termValidation");

const router = express.Router();

router.get("/public/terms", termController.getPublicTerms);
router.get("/public/terms/:taxonomy/:slug/posts", termController.getPublishedPostsByTerm);

router.get("/terms", authenticateJWT, authorizePermission(permissions.cmsTaxonomiesManage), termController.getTerms);
router.get("/terms/:id", authenticateJWT, authorizePermission(permissions.cmsTaxonomiesManage), termController.getTermById);
router.post("/terms", authenticateJWT, authorizePermission(permissions.cmsTaxonomiesManage), termValidation.validateCreateTerm, termController.createTerm);
router.put("/terms/:id", authenticateJWT, authorizePermission(permissions.cmsTaxonomiesManage), termValidation.validateUpdateTerm, termController.updateTerm);
router.delete("/terms/:id", authenticateJWT, authorizePermission(permissions.cmsTaxonomiesManage), termController.deleteTerm);

router.get("/posts/:id/terms", authenticateJWT, authorizePermission(permissions.cmsTaxonomiesManage), termController.getPostTerms);
router.put(
    "/posts/:id/terms",
    authenticateJWT,
    authorizePermission(permissions.cmsTaxonomiesManage),
    termValidation.validatePostTermsPayload,
    termController.replacePostTerms
);

module.exports = router;
