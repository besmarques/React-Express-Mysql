const connections = require("../../config/dbpool");

const postFields = `
    id,
    type,
    status,
    title,
    slug,
    template,
    excerpt,
    content_json AS contentJson,
    content_html AS contentHtml,
    author_id AS authorId,
    parent_id AS parentId,
    menu_order AS menuOrder,
    published_at AS publishedAt,
    created_at AS createdAt,
    updated_at AS updatedAt
`;

const revisionFields = `
    id,
    post_id AS postId,
    title,
    slug,
    template,
    excerpt,
    content_json AS contentJson,
    content_html AS contentHtml,
    status,
    author_id AS authorId,
    created_at AS createdAt
`;

const serializeJson = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    return typeof value === "string" ? value : JSON.stringify(value);
};

const parseJson = (value) => {
    if (!value || typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch (err) {
        return value;
    }
};

const mapPost = (post) => {
    if (!post) {
        return post;
    }

    return {
        ...post,
        contentJson: parseJson(post.contentJson),
    };
};

const mapRevision = (revision) => {
    if (!revision) {
        return revision;
    }

    return {
        ...revision,
        contentJson: parseJson(revision.contentJson),
    };
};

const listPosts = async ({ type, status } = {}) => {
    const where = [];
    const params = [];

    if (type) {
        where.push("type = ?");
        params.push(type);
    }

    if (status) {
        where.push("status = ?");
        params.push(status);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const [posts] = await connections.execute(
        `SELECT ${postFields} FROM cms_posts ${whereClause} ORDER BY updated_at DESC`,
        params
    );

    return posts.map(mapPost);
};

const findById = async (id) => {
    const [posts] = await connections.execute(
        `SELECT ${postFields} FROM cms_posts WHERE id = ? LIMIT 1`,
        [id]
    );

    return mapPost(posts[0]);
};

const findPublishedBySlug = async (type, slug) => {
    const [posts] = await connections.execute(
        `SELECT ${postFields}
         FROM cms_posts
         WHERE type = ?
            AND slug = ?
            AND status = 'published'
            AND (published_at IS NULL OR published_at <= UTC_TIMESTAMP())
         LIMIT 1`,
        [type, slug]
    );

    return mapPost(posts[0]);
};

const createPost = async (post) => {
    const [result] = await connections.execute(
        `INSERT INTO cms_posts (
            type,
            status,
            title,
            slug,
            template,
            excerpt,
            content_json,
            content_html,
            author_id,
            parent_id,
            menu_order,
            published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            post.type,
            post.status,
            post.title,
            post.slug,
            post.template || null,
            post.excerpt || null,
            serializeJson(post.contentJson),
            post.contentHtml || null,
            post.authorId,
            post.parentId || null,
            post.menuOrder || 0,
            post.publishedAt || null,
        ]
    );

    return findById(result.insertId);
};

const updatePost = async (id, post) => {
    const [result] = await connections.execute(
        `UPDATE cms_posts
         SET type = ?,
             status = ?,
             title = ?,
             slug = ?,
             template = ?,
             excerpt = ?,
             content_json = ?,
             content_html = ?,
             parent_id = ?,
             menu_order = ?,
             published_at = ?
         WHERE id = ?`,
        [
            post.type,
            post.status,
            post.title,
            post.slug,
            post.template || null,
            post.excerpt || null,
            serializeJson(post.contentJson),
            post.contentHtml || null,
            post.parentId || null,
            post.menuOrder || 0,
            post.publishedAt || null,
            id,
        ]
    );

    if (result.affectedRows === 0) {
        return undefined;
    }

    return findById(id);
};

const deletePost = async (id) => {
    const [result] = await connections.execute(
        "DELETE FROM cms_posts WHERE id = ?",
        [id]
    );

    return result;
};

const createRevision = async (postId, post, authorId) => {
    const [result] = await connections.execute(
        `INSERT INTO cms_revisions (
            post_id,
            title,
            slug,
            template,
            excerpt,
            content_json,
            content_html,
            status,
            author_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            postId,
            post.title,
            post.slug,
            post.template || null,
            post.excerpt || null,
            serializeJson(post.contentJson),
            post.contentHtml || null,
            post.status,
            authorId,
        ]
    );

    return findRevisionById(postId, result.insertId);
};

const findRevisionById = async (postId, revisionId) => {
    const [revisions] = await connections.execute(
        `SELECT ${revisionFields}
         FROM cms_revisions
         WHERE post_id = ? AND id = ?
         LIMIT 1`,
        [postId, revisionId]
    );

    return mapRevision(revisions[0]);
};

const listRevisions = async (postId) => {
    const [revisions] = await connections.execute(
        `SELECT ${revisionFields}
         FROM cms_revisions
         WHERE post_id = ?
         ORDER BY created_at DESC`,
        [postId]
    );

    return revisions.map(mapRevision);
};

module.exports = {
    createPost,
    createRevision,
    deletePost,
    findById,
    findPublishedBySlug,
    findRevisionById,
    listPosts,
    listRevisions,
    updatePost,
};
