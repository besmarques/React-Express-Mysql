const logger = require("../../config/logger");
const postService = require("./postService");

const logServerError = (err) => {
    if (err.errno || err.code || err.sqlMessage) {
        logger.error(`${err.errno} - ${err.code} - ${err.sqlMessage}`);
        return;
    }

    logger.error(err);
};

const sendError = (res, err) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json(err.responseBody);
    }

    logServerError(err);
    return res.status(500).json({ message: "Server error" });
};

const getPosts = async (req, res) => {
    try {
        const posts = await postService.getPosts({
            type: req.query.type,
            status: req.query.status,
        });
        return res.json(posts);
    } catch (err) {
        return sendError(res, err);
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.id);
        return res.json(post);
    } catch (err) {
        return sendError(res, err);
    }
};

const createPost = async (req, res) => {
    try {
        const post = await postService.createPost(req.body, req.user.id);
        return res.status(201).json(post);
    } catch (err) {
        return sendError(res, err);
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.body, req.user.id);
        return res.json(post);
    } catch (err) {
        return sendError(res, err);
    }
};

const deletePost = async (req, res) => {
    try {
        await postService.deletePost(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendError(res, err);
    }
};

const getPostRevisions = async (req, res) => {
    try {
        const revisions = await postService.getPostRevisions(req.params.id);
        return res.json(revisions);
    } catch (err) {
        return sendError(res, err);
    }
};

const getPostRevision = async (req, res) => {
    try {
        const revision = await postService.getPostRevision(req.params.id, req.params.revisionId);
        return res.json(revision);
    } catch (err) {
        return sendError(res, err);
    }
};

const restorePostRevision = async (req, res) => {
    try {
        const post = await postService.restorePostRevision(req.params.id, req.params.revisionId, req.user.id);
        return res.json(post);
    } catch (err) {
        return sendError(res, err);
    }
};

const getPublishedPageBySlug = async (req, res) => {
    try {
        const post = await postService.getPublishedPageBySlug(req.params.slug);
        return res.json(post);
    } catch (err) {
        return sendError(res, err);
    }
};

const getPublishedPostBySlug = async (req, res) => {
    try {
        const post = await postService.getPublishedPostBySlug(req.params.slug);
        return res.json(post);
    } catch (err) {
        return sendError(res, err);
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
