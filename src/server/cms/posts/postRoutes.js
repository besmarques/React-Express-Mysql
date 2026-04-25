const express = require("express");
const authenticateJWT = require("../../config/auth");
const { authorizePermission } = require("../../config/auth");
const { permissions } = require("../permissions/permissionConstants");
const postController = require("./postController");
const postValidation = require("./postValidation");

const router = express.Router();

router.get("/public/pages/:slug", postController.getPublishedPageBySlug);
router.get("/public/posts/:slug", postController.getPublishedPostBySlug);

router.get("/posts", authenticateJWT, authorizePermission(permissions.cmsPostsRead), postController.getPosts);
router.get("/posts/:id/revisions", authenticateJWT, authorizePermission(permissions.cmsPostsRead), postController.getPostRevisions);
router.get("/posts/:id/revisions/:revisionId", authenticateJWT, authorizePermission(permissions.cmsPostsRead), postController.getPostRevision);
router.post("/posts/:id/revisions/:revisionId/restore", authenticateJWT, authorizePermission(permissions.cmsPostsUpdate), postController.restorePostRevision);
router.get("/posts/:id", authenticateJWT, authorizePermission(permissions.cmsPostsRead), postController.getPostById);
router.post("/posts", authenticateJWT, authorizePermission(permissions.cmsPostsCreate), postValidation.validateCreatePost, postController.createPost);
router.put("/posts/:id", authenticateJWT, authorizePermission(permissions.cmsPostsUpdate), postValidation.validateUpdatePost, postController.updatePost);
router.delete("/posts/:id", authenticateJWT, authorizePermission(permissions.cmsPostsDelete), postController.deletePost);

module.exports = router;
