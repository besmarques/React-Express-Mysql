const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizeAdmin } = require("../../config/auth");
const termController = require("./termController");
const termValidation = require("./termValidation");

const router = express.Router();

router.get("/public/terms", termController.getPublicTerms);
router.get("/public/terms/:taxonomy/:slug/posts", termController.getPublishedPostsByTerm);

router.get("/terms", authenticateJWT, authorizeAdmin, termController.getTerms);
router.get("/terms/:id", authenticateJWT, authorizeAdmin, termController.getTermById);
router.post("/terms", authenticateJWT, authorizeAdmin, termValidation.validateCreateTerm, termController.createTerm);
router.put("/terms/:id", authenticateJWT, authorizeAdmin, termValidation.validateUpdateTerm, termController.updateTerm);
router.delete("/terms/:id", authenticateJWT, authorizeAdmin, termController.deleteTerm);

router.get("/posts/:id/terms", authenticateJWT, authorizeAdmin, termController.getPostTerms);
router.put(
    "/posts/:id/terms",
    authenticateJWT,
    authorizeAdmin,
    termValidation.validatePostTermsPayload,
    termController.replacePostTerms
);

module.exports = router;
