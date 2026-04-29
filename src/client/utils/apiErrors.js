const getApiError = (err, fallbackMessage = 'Request failed') => {
    const data = err?.response?.data;
    const statusCode = err?.response?.status;

    if (typeof data === 'string') {
        return {
            code: statusCode ? `HTTP_${statusCode}` : 'REQUEST_FAILED',
            message: data,
            errors: [],
            statusCode,
        };
    }

    const errors = Array.isArray(data?.errors)
        ? data.errors.filter((error) => error && typeof error.message === 'string')
        : [];

    if (typeof data?.message === 'string' && data.message.trim().length > 0) {
        return {
            code: typeof data.code === 'string' && data.code.trim().length > 0 ? data.code : 'REQUEST_FAILED',
            message: data.message,
            errors,
            statusCode,
        };
    }

    if (errors.length > 0) {
        return {
            code: typeof data?.code === 'string' && data.code.trim().length > 0 ? data.code : 'VALIDATION_ERROR',
            message: errors[0].message,
            errors,
            statusCode,
        };
    }

    if (typeof err?.message === 'string' && err.message.trim().length > 0) {
        return {
            code: 'REQUEST_FAILED',
            message: err.message,
            errors: [],
            statusCode,
        };
    }

    return {
        code: 'REQUEST_FAILED',
        message: fallbackMessage,
        errors: [],
        statusCode,
    };
};

const getApiErrorMessage = (err, fallbackMessage = 'Request failed') => (
    getApiError(err, fallbackMessage).message
);

const getApiErrorFieldMessages = (err) => {
    const { errors } = getApiError(err);

    return errors.reduce((fieldErrors, error) => {
        if (typeof error.field === 'string' && error.field.length > 0) {
            fieldErrors[error.field] = error.message;
        }

        return fieldErrors;
    }, {});
};

export { getApiError, getApiErrorFieldMessages };
export default getApiErrorMessage;
