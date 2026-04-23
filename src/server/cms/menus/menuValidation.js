const allowedItemTypes = new Set(["custom", "page", "post", "category", "tag"]);

const isPresent = (value) => value !== undefined && value !== null && String(value).trim().length > 0;
const isIntegerLike = (value) => isPresent(value) && Number.isInteger(Number(value));

const sendValidationError = (res, errors) => res.status(400).json({
    message: "Validation failed",
    errors,
});

const validateMenuPayload = ({ requireRequiredFields }) => (req, res, next) => {
    const errors = [];
    const { location, name, slug } = req.body;

    if (requireRequiredFields || name !== undefined) {
        if (!isPresent(name)) {
            errors.push({ field: "name", message: "Name is required" });
        }
    }

    if (requireRequiredFields || slug !== undefined) {
        if (!isPresent(slug)) {
            errors.push({ field: "slug", message: "Slug is required" });
        }
    }

    if (location !== undefined && location !== null && typeof location !== "string") {
        errors.push({ field: "location", message: "Location must be a string" });
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

const validateMenuItemPayload = ({ requireRequiredFields }) => (req, res, next) => {
    const errors = [];
    const {
        itemType,
        label,
        parentId,
        sortOrder,
        targetId,
        url,
    } = req.body;

    if (requireRequiredFields || label !== undefined) {
        if (!isPresent(label)) {
            errors.push({ field: "label", message: "Label is required" });
        }
    }

    if (itemType !== undefined && !allowedItemTypes.has(itemType)) {
        errors.push({ field: "itemType", message: "Item type must be custom, page, post, category, or tag" });
    }

    if (parentId !== undefined && parentId !== null && !isIntegerLike(parentId)) {
        errors.push({ field: "parentId", message: "Parent id must be an integer" });
    }

    if (targetId !== undefined && targetId !== null && !isIntegerLike(targetId)) {
        errors.push({ field: "targetId", message: "Target id must be an integer" });
    }

    if (sortOrder !== undefined && !isIntegerLike(sortOrder)) {
        errors.push({ field: "sortOrder", message: "Sort order must be an integer" });
    }

    if (url !== undefined && url !== null && typeof url !== "string") {
        errors.push({ field: "url", message: "URL must be a string" });
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

module.exports = {
    validateCreateMenu: validateMenuPayload({ requireRequiredFields: true }),
    validateCreateMenuItem: validateMenuItemPayload({ requireRequiredFields: true }),
    validateUpdateMenu: validateMenuPayload({ requireRequiredFields: false }),
    validateUpdateMenuItem: validateMenuItemPayload({ requireRequiredFields: false }),
};
