const logger = require("../../config/logger");
const { sendControllerError } = require("../../config/errorResponses");
const mediaService = require("./mediaService");

const getMedia = async (req, res) => {
    try {
        const media = await mediaService.getMedia({ mimeType: req.query.mimeType });
        return res.json(media);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MEDIA_LIST_FAILED",
            message: "Unable to load media right now.",
        });
    }
};

const getMediaById = async (req, res) => {
    try {
        const media = await mediaService.getMediaById(req.params.id);
        return res.json(media);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MEDIA_LOAD_FAILED",
            message: "Unable to load this media item.",
        });
    }
};

const uploadMedia = async (req, res) => {
    try {
        const media = await mediaService.uploadMedia(req.body, req.user.id);
        return res.status(201).json(media);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MEDIA_UPLOAD_FAILED",
            message: "Unable to upload this media item.",
        });
    }
};

const updateMedia = async (req, res) => {
    try {
        const media = await mediaService.updateMedia(req.params.id, req.body);
        return res.json(media);
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MEDIA_UPDATE_FAILED",
            message: "Unable to save this media item.",
        });
    }
};

const deleteMedia = async (req, res) => {
    try {
        await mediaService.deleteMedia(req.params.id);
        return res.status(204).send();
    } catch (err) {
        return sendControllerError(res, logger, err, {
            code: "CMS_MEDIA_DELETE_FAILED",
            message: "Unable to delete this media item.",
        });
    }
};

module.exports = {
    deleteMedia,
    getMedia,
    getMediaById,
    updateMedia,
    uploadMedia,
};
