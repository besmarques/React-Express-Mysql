const parseBoolean = (value, fallback) => {
    if (value === undefined || value === '') {
        return fallback;
    }

    return value.toLowerCase() === 'true';
};

const isProduction = process.env.NODE_ENV === 'production';
const secure = parseBoolean(process.env.COOKIE_SECURE, isProduction);

const tokenCookieOptions = {
    secure,
    httpOnly: true,
    sameSite: 'strict',
};

const sessionCookieOptions = {
    maxAge: 1 * 3600000, // 1 hour
    secure,
    sameSite: 'strict',
};

const sessionClearCookieOptions = {
    secure,
    sameSite: sessionCookieOptions.sameSite,
};

module.exports = {
    sessionClearCookieOptions,
    sessionCookieOptions,
    tokenCookieOptions,
};
