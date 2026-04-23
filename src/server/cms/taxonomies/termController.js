const logger = require("../../config/logger");
const termService = require("./termService");

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

const getTerms = async (req, res) => {
    try {
        const terms = await termService.getTerms({ taxonomy: req.query.taxonomy });
        return res.json(terms);
    } catch (err) {
        return sendError(res, err);
    }
};

const getTermById = async (req, res) => {
    try {
        const term = await termService.getTermById(req.params.id);
        return res.json(term);
    } catch (err) {
        return sendError(res, err);
    }
};

const createTerm = async (req, res) => {
    try {
        const term = await termService.createTerm(req.body);
        return res.status(201).json(term);
    } catch (err) {
        return sendError(res, err);
    }
};

const updateTerm = async (req, res) => {
    try {
        const term = await termService.updateTerm(req.params.id, req.body);
        return res.json(term);
    } catch (err) {
        return sendError(res, err);
    }
};

const deleteTerm = async (req, res) => {
    try {
        await termService.deleteTerm(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendError(res, err);
    }
};

const getPostTerms = async (req, res) => {
    try {
        const terms = await termService.getPostTerms(req.params.id);
        return res.json(terms);
    } catch (err) {
        return sendError(res, err);
    }
};

const replacePostTerms = async (req, res) => {
    try {
        const terms = await termService.replacePostTerms(req.params.id, req.body.termIds);
        return res.json(terms);
    } catch (err) {
        return sendError(res, err);
    }
};

const getPublicTerms = async (req, res) => {
    try {
        const terms = await termService.getPublicTerms({ taxonomy: req.query.taxonomy });
        return res.json(terms);
    } catch (err) {
        return sendError(res, err);
    }
};

const getPublishedPostsByTerm = async (req, res) => {
    try {
        const posts = await termService.getPublishedPostsByTerm(req.params.taxonomy, req.params.slug);
        return res.json(posts);
    } catch (err) {
        return sendError(res, err);
    }
};

module.exports = {
    createTerm,
    deleteTerm,
    getPostTerms,
    getPublicTerms,
    getPublishedPostsByTerm,
    getTermById,
    getTerms,
    replacePostTerms,
    updateTerm,
};
