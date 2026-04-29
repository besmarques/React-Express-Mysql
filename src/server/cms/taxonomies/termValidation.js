const { sendValidationError } = require("../../config/errorResponses");

const allowedTaxonomies = new Set(["category", "tag"]);

const isPresent = (value) => value !== undefined && value !== null && String(value).trim().length > 0;
const isIntegerLike = (value) => isPresent(value) && Number.isInteger(Number(value));

const validateTermPayload = ({ requireRequiredFields }) => (req, res, next) => {
    const errors = [];
    const {
        description,
        name,
        parentId,
        slug,
        taxonomy,
    } = req.body;

    if (requireRequiredFields || taxonomy !== undefined) {
        if (!allowedTaxonomies.has(taxonomy)) {
            errors.push({ field: "taxonomy", message: "Taxonomy must be category or tag" });
        }
    }

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

    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.push({ field: "description", message: "Description must be a string" });
    }

    if (parentId !== undefined && parentId !== null && !isIntegerLike(parentId)) {
        errors.push({ field: "parentId", message: "Parent id must be an integer" });
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

const validatePostTermsPayload = (req, res, next) => {
    const { termIds } = req.body;
    const errors = [];

    if (!Array.isArray(termIds)) {
        errors.push({ field: "termIds", message: "Term ids must be an array" });
    } else if (termIds.some((termId) => !isIntegerLike(termId))) {
        errors.push({ field: "termIds", message: "Term ids must be integers" });
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

module.exports = {
    validateCreateTerm: validateTermPayload({ requireRequiredFields: true }),
    validatePostTermsPayload,
    validateUpdateTerm: validateTermPayload({ requireRequiredFields: false }),
};
