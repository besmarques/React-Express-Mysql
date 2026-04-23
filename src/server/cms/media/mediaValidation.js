const isPresent = (value) => value !== undefined && value !== null && String(value).trim().length > 0;

const sendValidationError = (res, errors) => res.status(400).json({
    message: "Validation failed",
    errors,
});

const validateUploadMedia = (req, res, next) => {
    const errors = [];
    const {
        altText,
        caption,
        data,
        mimeType,
        originalName,
    } = req.body;

    if (!isPresent(originalName)) {
        errors.push({ field: "originalName", message: "Original name is required" });
    }

    if (!isPresent(mimeType)) {
        errors.push({ field: "mimeType", message: "Mime type is required" });
    }

    if (!isPresent(data)) {
        errors.push({ field: "data", message: "File data is required" });
    }

    if (altText !== undefined && altText !== null && typeof altText !== "string") {
        errors.push({ field: "altText", message: "Alt text must be a string" });
    }

    if (caption !== undefined && caption !== null && typeof caption !== "string") {
        errors.push({ field: "caption", message: "Caption must be a string" });
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

const validateUpdateMedia = (req, res, next) => {
    const errors = [];
    const { altText, caption } = req.body;

    if (altText !== undefined && altText !== null && typeof altText !== "string") {
        errors.push({ field: "altText", message: "Alt text must be a string" });
    }

    if (caption !== undefined && caption !== null && typeof caption !== "string") {
        errors.push({ field: "caption", message: "Caption must be a string" });
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

module.exports = {
    validateUpdateMedia,
    validateUploadMedia,
};
