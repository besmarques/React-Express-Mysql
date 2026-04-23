const logger = require("../../config/logger");
const mediaService = require("./mediaService");

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

const getMedia = async (req, res) => {
    try {
        const media = await mediaService.getMedia({ mimeType: req.query.mimeType });
        return res.json(media);
    } catch (err) {
        return sendError(res, err);
    }
};

const getMediaById = async (req, res) => {
    try {
        const media = await mediaService.getMediaById(req.params.id);
        return res.json(media);
    } catch (err) {
        return sendError(res, err);
    }
};

const uploadMedia = async (req, res) => {
    try {
        const media = await mediaService.uploadMedia(req.body, req.user.id);
        return res.status(201).json(media);
    } catch (err) {
        return sendError(res, err);
    }
};

const updateMedia = async (req, res) => {
    try {
        const media = await mediaService.updateMedia(req.params.id, req.body);
        return res.json(media);
    } catch (err) {
        return sendError(res, err);
    }
};

const deleteMedia = async (req, res) => {
    try {
        await mediaService.deleteMedia(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendError(res, err);
    }
};

module.exports = {
    deleteMedia,
    getMedia,
    getMediaById,
    updateMedia,
    uploadMedia,
};
