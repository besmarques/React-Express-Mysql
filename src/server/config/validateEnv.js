const requiredEnvVariables = [
    'APP_PUBLIC_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_NAME'
];

const optionalEnvVariables = [
    'DB_PASSWORD',
    'EMAIL_USERNAME',
    'EMAIL_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
];

const getMissingServerEnv = (env = process.env) => (
    requiredEnvVariables.filter((name) => !env[name] || env[name].trim() === '')
);

const validateServerEnv = (env = process.env) => {
    const missingVariables = getMissingServerEnv(env);

    if (missingVariables.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    }
};

module.exports = {
    getMissingServerEnv,
    optionalEnvVariables,
    validateServerEnv,
};
