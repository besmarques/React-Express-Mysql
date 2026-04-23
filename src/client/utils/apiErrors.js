const getApiErrorMessage = (err, fallbackMessage = 'Request failed') => {
    const data = err?.response?.data;

    if (typeof data === 'string') {
        return data;
    }

    if (data?.errors && Array.isArray(data.errors)) {
        return data.errors.map((error) => error.message).join(' ');
    }

    if (typeof data?.message === 'string') {
        return data.message;
    }

    if (typeof err?.message === 'string') {
        return err.message;
    }

    return fallbackMessage;
};

export default getApiErrorMessage;
