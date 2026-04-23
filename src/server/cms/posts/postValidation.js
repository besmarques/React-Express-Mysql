const allowedTypes = new Set(["post", "page"]);
const allowedStatuses = new Set(["draft", "published", "private", "trash"]);
const allowedContentFormats = new Set(["markdown"]);

const isPresent = (value) => value !== undefined && value !== null && String(value).trim().length > 0;
const isIntegerLike = (value) => Number.isInteger(Number(value));

const sendValidationError = (res, errors) => res.status(400).json({
    message: "Validation failed",
    errors,
});

const validatePostPayload = ({ requireTitleAndSlug }) => (req, res, next) => {
    const errors = [];
    const {
        contentJson,
        contentHtml,
        menuOrder,
        parentId,
        publishedAt,
        slug,
        status,
        template,
        title,
        type,
    } = req.body;

    if (requireTitleAndSlug || title !== undefined) {
        if (!isPresent(title)) {
            errors.push({ field: "title", message: "Title is required" });
        }
    }

    if (requireTitleAndSlug || slug !== undefined) {
        if (!isPresent(slug)) {
            errors.push({ field: "slug", message: "Slug is required" });
        }
    }

    if (type !== undefined && !allowedTypes.has(type)) {
        errors.push({ field: "type", message: "Type must be post or page" });
    }

    if (status !== undefined && !allowedStatuses.has(status)) {
        errors.push({ field: "status", message: "Status must be draft, published, private, or trash" });
    }

    if (template !== undefined && template !== null && typeof template !== "string") {
        errors.push({ field: "template", message: "Template must be a string" });
    }

    if (parentId !== undefined && parentId !== null && !isIntegerLike(parentId)) {
        errors.push({ field: "parentId", message: "Parent id must be an integer" });
    }

    if (menuOrder !== undefined && !isIntegerLike(menuOrder)) {
        errors.push({ field: "menuOrder", message: "Menu order must be an integer" });
    }

    if (publishedAt !== undefined && publishedAt !== null && Number.isNaN(Date.parse(publishedAt))) {
        errors.push({ field: "publishedAt", message: "Published date must be valid" });
    }

    if (contentHtml !== undefined && contentHtml !== null && typeof contentHtml !== "string") {
        errors.push({ field: "contentHtml", message: "Content HTML must be a string" });
    }

    if (contentJson !== undefined && contentJson !== null) {
        if (typeof contentJson !== "object" || Array.isArray(contentJson)) {
            errors.push({ field: "contentJson", message: "Content JSON must be an object" });
        } else {
            if (!allowedContentFormats.has(contentJson.format)) {
                errors.push({ field: "contentJson.format", message: "Content format must be markdown" });
            }

            if (typeof contentJson.markdown !== "string") {
                errors.push({ field: "contentJson.markdown", message: "Markdown content must be a string" });
            }
        }
    }

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    return next();
};

module.exports = {
    validateCreatePost: validatePostPayload({ requireTitleAndSlug: true }),
    validateUpdatePost: validatePostPayload({ requireTitleAndSlug: false }),
};
