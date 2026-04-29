const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { createHttpError } = require("../../config/errorResponses");
const { getMediaConfig } = require("./mediaConfig");
const mediaRepository = require("./mediaRepository");

const sanitizeFilename = (filename) => {
    const parsed = path.parse(filename || "upload");
    const name = parsed.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "upload";
    const extension = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "");

    return `${name}${extension}`;
};

const decodeBase64Data = (data) => {
    const base64Data = String(data || "").includes(",")
        ? String(data).split(",").pop()
        : String(data || "");

    return Buffer.from(base64Data, "base64");
};

const assertAllowedMimeType = (mimeType, config) => {
    if (!config.allowedTypes.includes(mimeType)) {
        throw createHttpError(400, { message: "Media type is not allowed." });
    }
};

const assertAllowedSize = (buffer, config) => {
    if (buffer.length === 0) {
        throw createHttpError(400, { message: "Media file is empty." });
    }

    if (buffer.length > config.maxBytes) {
        throw createHttpError(400, { message: "Media file is too large." });
    }
};

const getMedia = async (filters = {}) => mediaRepository.listMedia(filters);

const getMediaById = async (id) => {
    const media = await mediaRepository.findById(id);

    if (!media) {
        throw createHttpError(404, { message: "CMS media not found." });
    }

    return media;
};

const uploadMedia = async (payload, uploadedBy, env = process.env) => {
    const config = getMediaConfig(env);
    const buffer = decodeBase64Data(payload.data);
    const originalName = payload.originalName || "upload";
    const safeOriginalName = sanitizeFilename(originalName);
    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeOriginalName}`;
    const filePath = path.join(config.directory, filename);
    const url = `${config.publicPath}/${filename}`;

    assertAllowedMimeType(payload.mimeType, config);
    assertAllowedSize(buffer, config);

    await fs.mkdir(config.directory, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return mediaRepository.createMedia({
        altText: payload.altText,
        caption: payload.caption,
        filename,
        mimeType: payload.mimeType,
        originalName,
        size: buffer.length,
        uploadedBy,
        url,
    });
};

const updateMedia = async (id, payload) => {
    await getMediaById(id);
    const updatedMedia = await mediaRepository.updateMedia(id, {
        altText: payload.altText,
        caption: payload.caption,
    });

    if (!updatedMedia) {
        throw createHttpError(404, { message: "CMS media not found." });
    }

    return updatedMedia;
};

const deleteMedia = async (id, env = process.env) => {
    const media = await getMediaById(id);
    const result = await mediaRepository.deleteMedia(id);

    if (!result || result.affectedRows === 0) {
        throw createHttpError(404, { message: "CMS media not found." });
    }

    const config = getMediaConfig(env);
    const filePath = path.join(config.directory, media.filename);

    try {
        await fs.unlink(filePath);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
};

module.exports = {
    deleteMedia,
    getMedia,
    getMediaById,
    uploadMedia,
    updateMedia,
};
