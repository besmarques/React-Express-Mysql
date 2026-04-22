const express = require("express");
const router = express.Router();

const parseBooleanSetting = (value, defaultValue = true) => {
    if (value === undefined) {
        return defaultValue;
    }

    return !["false", "0", "no", "off"].includes(value.toLowerCase());
};

router.get("/settings", (req, res) => {
    res.json({
        signup: parseBooleanSetting(process.env.SIGNUP_ENABLED),
    });
});

module.exports = router;
