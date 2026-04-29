const logger = require("../../config/logger");
const { sendControllerError } = require("../../config/errorResponses");
const postService = require("./postService");

const getPosts = async (req, res) => {
    try {
        const posts = await postService.getPosts({
            type: req.query.type,
            status: req.query.status,
        });
        return res.json(posts);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_LIST_FAILED",
            message: "Unable to load content right now.",
        });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.id);
        return res.json(post);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_LOAD_FAILED",
            message: "Unable to load this content item.",
        });
    }
};

const createPost = async (req, res) => {
    try {
        const post = await postService.createPost(req.body, req.user);
        return res.status(201).json(post);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_CREATE_FAILED",
            message: "Unable to create this content item.",
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.body, req.user);
        return res.json(post);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_UPDATE_FAILED",
            message: "Unable to save changes to this content item.",
        });
    }
};

const deletePost = async (req, res) => {
    try {
        await postService.deletePost(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_DELETE_FAILED",
            message: "Unable to delete this content item.",
        });
    }
};

const getPostRevisions = async (req, res) => {
    try {
        const revisions = await postService.getPostRevisions(req.params.id);
        return res.json(revisions);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_REVISIONS_LOAD_FAILED",
            message: "Unable to load revisions for this content item.",
        });
    }
};

const getPostRevision = async (req, res) => {
    try {
        const revision = await postService.getPostRevision(req.params.id, req.params.revisionId);
        return res.json(revision);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_REVISION_LOAD_FAILED",
            message: "Unable to load this revision.",
        });
    }
};

const restorePostRevision = async (req, res) => {
    try {
        const post = await postService.restorePostRevision(req.params.id, req.params.revisionId, req.user);
        return res.json(post);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_REVISION_RESTORE_FAILED",
            message: "Unable to restore this revision.",
        });
    }
};

const getPublishedPageBySlug = async (req, res) => {
    try {
        const post = await postService.getPublishedPageBySlug(req.params.slug);
        return res.json(post);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_PAGE_LOAD_FAILED",
            message: "Unable to load this page right now.",
        });
    }
};

const getPublishedPostBySlug = async (req, res) => {
    try {
        const post = await postService.getPublishedPostBySlug(req.params.slug);
        return res.json(post);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_PUBLIC_POST_LOAD_FAILED",
            message: "Unable to load this post right now.",
        });
    }
};

module.exports = {
    createPost,
    deletePost,
    getPostById,
    getPostRevision,
    getPostRevisions,
    getPosts,
    getPublishedPageBySlug,
    getPublishedPostBySlug,
    restorePostRevision,
    updatePost,
};
