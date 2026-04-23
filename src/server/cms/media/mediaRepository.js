const connections = require("../../config/dbpool");

const mediaFields = `
    id,
    filename,
    original_name AS originalName,
    mime_type AS mimeType,
    size,
    url,
    alt_text AS altText,
    caption,
    uploaded_by AS uploadedBy,
    created_at AS createdAt
`;

const listMedia = async ({ mimeType } = {}) => {
    const params = [];
    const whereClause = mimeType ? "WHERE mime_type = ?" : "";

    if (mimeType) {
        params.push(mimeType);
    }

    const [media] = await connections.execute(
        `SELECT ${mediaFields} FROM cms_media ${whereClause} ORDER BY created_at DESC, id DESC`,
        params
    );

    return media;
};

const findById = async (id) => {
    const [media] = await connections.execute(
        `SELECT ${mediaFields} FROM cms_media WHERE id = ? LIMIT 1`,
        [id]
    );

    return media[0];
};

const createMedia = async (media) => {
    const [result] = await connections.execute(
        `INSERT INTO cms_media (
            filename,
            original_name,
            mime_type,
            size,
            url,
            alt_text,
            caption,
            uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            media.filename,
            media.originalName,
            media.mimeType,
            media.size,
            media.url,
            media.altText || null,
            media.caption || null,
            media.uploadedBy,
        ]
    );

    return findById(result.insertId);
};

const updateMedia = async (id, media) => {
    const [result] = await connections.execute(
        `UPDATE cms_media
         SET alt_text = ?,
             caption = ?
         WHERE id = ?`,
        [
            media.altText || null,
            media.caption || null,
            id,
        ]
    );

    if (result.affectedRows === 0) {
        return undefined;
    }

    return findById(id);
};

const deleteMedia = async (id) => {
    const [result] = await connections.execute(
        "DELETE FROM cms_media WHERE id = ?",
        [id]
    );

    return result;
};

module.exports = {
    createMedia,
    deleteMedia,
    findById,
    listMedia,
    updateMedia,
};
