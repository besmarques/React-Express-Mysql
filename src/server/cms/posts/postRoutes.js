const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizeAdmin } = require("../../config/auth");
const postController = require("./postController");
const postValidation = require("./postValidation");

const router = express.Router();

router.get("/public/pages/:slug", postController.getPublishedPageBySlug);
router.get("/public/posts/:slug", postController.getPublishedPostBySlug);

router.get("/posts", authenticateJWT, authorizeAdmin, postController.getPosts);
router.get("/posts/:id/revisions", authenticateJWT, authorizeAdmin, postController.getPostRevisions);
router.get("/posts/:id/revisions/:revisionId", authenticateJWT, authorizeAdmin, postController.getPostRevision);
router.post("/posts/:id/revisions/:revisionId/restore", authenticateJWT, authorizeAdmin, postController.restorePostRevision);
router.get("/posts/:id", authenticateJWT, authorizeAdmin, postController.getPostById);
router.post("/posts", authenticateJWT, authorizeAdmin, postValidation.validateCreatePost, postController.createPost);
router.put("/posts/:id", authenticateJWT, authorizeAdmin, postValidation.validateUpdatePost, postController.updatePost);
router.delete("/posts/:id", authenticateJWT, authorizeAdmin, postController.deletePost);

module.exports = router;
