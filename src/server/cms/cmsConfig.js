const truthyValues = new Set(['true', '1', 'yes', 'on']);

const isCmsEnabled = (env = process.env) => (
    truthyValues.has(String(env.CMS_ENABLED || '').trim().toLowerCase())
);

module.exports = {
    isCmsEnabled,
};
