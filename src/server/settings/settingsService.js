const parseBooleanSetting = (value, defaultValue = true) => {
    if (value === undefined) {
        return defaultValue;
    }

    return !["false", "0", "no", "off"].includes(value.toLowerCase());
};

const getSettings = () => ({
    signup: parseBooleanSetting(process.env.SIGNUP_ENABLED),
});

module.exports = {
    getSettings,
};
