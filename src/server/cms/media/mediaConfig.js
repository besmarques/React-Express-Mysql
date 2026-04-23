const path = require("path");

const defaultAllowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
];

const normalizePublicPath = (publicPath) => {
    const withLeadingSlash = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
    return withLeadingSlash.replace(/\/+$/, "");
};

const getMediaConfig = (env = process.env) => {
    const configuredDirectory = env.CMS_MEDIA_DIR || "uploads/cms";
    const maxBytes = Number(env.CMS_MEDIA_MAX_BYTES || 5 * 1024 * 1024);
    const allowedTypes = (env.CMS_MEDIA_ALLOWED_TYPES || defaultAllowedTypes.join(","))
        .split(",")
        .map((type) => type.trim())
        .filter(Boolean);

    return {
        allowedTypes,
        directory: path.isAbsolute(configuredDirectory)
            ? configuredDirectory
            : path.resolve(process.cwd(), configuredDirectory),
        maxBytes,
        publicPath: normalizePublicPath(env.CMS_MEDIA_PUBLIC_PATH || "/media/cms"),
    };
};

module.exports = {
    getMediaConfig,
};
