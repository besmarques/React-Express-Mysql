const logger = require("../../config/logger");
const { sendControllerError } = require("../../config/errorResponses");
const termService = require("./termService");

const getTerms = async (req, res) => {
    try {
        const terms = await termService.getTerms({ taxonomy: req.query.taxonomy });
        return res.json(terms);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_TERMS_LIST_FAILED",
            message: "Unable to load terms right now.",
        });
    }
};

const getTermById = async (req, res) => {
    try {
        const term = await termService.getTermById(req.params.id);
        return res.json(term);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_TERM_LOAD_FAILED",
            message: "Unable to load this term.",
        });
    }
};

const createTerm = async (req, res) => {
    try {
        const term = await termService.createTerm(req.body);
        return res.status(201).json(term);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_TERM_CREATE_FAILED",
            message: "Unable to create this term.",
        });
    }
};

const updateTerm = async (req, res) => {
    try {
        const term = await termService.updateTerm(req.params.id, req.body);
        return res.json(term);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_TERM_UPDATE_FAILED",
            message: "Unable to save this term.",
        });
    }
};

const deleteTerm = async (req, res) => {
    try {
        await termService.deleteTerm(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_TERM_DELETE_FAILED",
            message: "Unable to delete this term.",
        });
    }
};

const getPostTerms = async (req, res) => {
    try {
        const terms = await termService.getPostTerms(req.params.id);
        return res.json(terms);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_TERMS_LOAD_FAILED",
            message: "Unable to load terms for this content item.",
        });
    }
};

const replacePostTerms = async (req, res) => {
    try {
        const terms = await termService.replacePostTerms(req.params.id, req.body.termIds);
        return res.json(terms);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_POST_TERMS_UPDATE_FAILED",
            message: "Unable to save terms for this content item.",
        });
    }
};

const getPublicTerms = async (req, res) => {
    try {
        const terms = await termService.getPublicTerms({ taxonomy: req.query.taxonomy });
        return res.json(terms);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_PUBLIC_TERMS_LOAD_FAILED",
            message: "Unable to load terms right now.",
        });
    }
};

const getPublishedPostsByTerm = async (req, res) => {
    try {
        const posts = await termService.getPublishedPostsByTerm(req.params.taxonomy, req.params.slug);
        return res.json(posts);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_TERM_ARCHIVE_LOAD_FAILED",
            message: "Unable to load this archive right now.",
        });
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
