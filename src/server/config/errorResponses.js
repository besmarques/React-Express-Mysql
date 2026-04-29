const defaultStatusCodes = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    500: "INTERNAL_SERVER_ERROR",
    503: "SERVICE_UNAVAILABLE",
};

const getDefaultCode = (statusCode) => defaultStatusCodes[statusCode] || "REQUEST_FAILED";

const normalizeErrorResponse = (responseBody, statusCode, fallback = {}) => {
    const normalizedBody = typeof responseBody === "string"
        ? { message: responseBody }
        : { ...(responseBody || {}) };

    if (typeof normalizedBody.message !== "string" || normalizedBody.message.trim().length === 0) {
        normalizedBody.message = fallback.message || "Something went wrong. Please try again.";
    }

    if (typeof normalizedBody.code !== "string" || normalizedBody.code.trim().length === 0) {
        normalizedBody.code = fallback.code || getDefaultCode(statusCode);
    }

    if (!Array.isArray(normalizedBody.errors) || normalizedBody.errors.length === 0) {
        delete normalizedBody.errors;
    }

    return normalizedBody;
};

const createHttpError = (statusCode, responseBody, fallback = {}) => {
    const normalizedBody = normalizeErrorResponse(responseBody, statusCode, fallback);
    const error = new Error(normalizedBody.message);
    error.statusCode = statusCode;
    error.responseBody = normalizedBody;
    return error;
};

const sendValidationError = (res, errors, message = "Please correct the highlighted fields and try again.") => (
    res.status(400).json({
        code: "VALIDATION_ERROR",
        message,
        errors,
    })
);

const logServerError = (logger, err, errorCode = "INTERNAL_SERVER_ERROR") => {
    if (err.errno || err.code || err.sqlMessage) {
        logger.error(`${errorCode} - ${err.errno || "NO_ERRNO"} - ${err.code || "NO_CODE"} - ${err.sqlMessage || err.message}`);
        return;
    }

    if (err && err.stack) {
        logger.error(`${errorCode} - ${err.stack}`);
        return;
    }

    logger.error(`${errorCode} - ${err}`);
};

const sendControllerError = (res, logger, err, fallback = {}) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json(
            normalizeErrorResponse(err.responseBody, err.statusCode)
        );
    }

    logServerError(logger, err, fallback.code || "INTERNAL_SERVER_ERROR");
    return res.status(500).json(normalizeErrorResponse(null, 500, fallback));
};

module.exports = {
    createHttpError,
    logServerError,
    normalizeErrorResponse,
    sendControllerError,
    sendValidationError,
};
