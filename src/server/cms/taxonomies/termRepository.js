const connections = require("../../config/dbpool");

const termFields = `
    cms_terms.id,
    cms_terms.taxonomy,
    cms_terms.name,
    cms_terms.slug,
    cms_terms.description,
    cms_terms.parent_id AS parentId,
    cms_terms.created_at AS createdAt,
    cms_terms.updated_at AS updatedAt
`;

const postFields = `
    cms_posts.id,
    cms_posts.type,
    cms_posts.status,
    cms_posts.title,
    cms_posts.slug,
    cms_posts.template,
    cms_posts.excerpt,
    cms_posts.content_json AS contentJson,
    cms_posts.content_html AS contentHtml,
    cms_posts.author_id AS authorId,
    cms_posts.parent_id AS parentId,
    cms_posts.menu_order AS menuOrder,
    cms_posts.published_at AS publishedAt,
    cms_posts.created_at AS createdAt,
    cms_posts.updated_at AS updatedAt
`;

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

const listTerms = async ({ taxonomy } = {}) => {
    const params = [];
    const whereClause = taxonomy ? "WHERE taxonomy = ?" : "";

    if (taxonomy) {
        params.push(taxonomy);
    }

    const [terms] = await connections.execute(
        `SELECT ${termFields} FROM cms_terms ${whereClause} ORDER BY taxonomy ASC, name ASC`,
        params
    );

    return terms;
};

const findById = async (id) => {
    const [terms] = await connections.execute(
        `SELECT ${termFields} FROM cms_terms WHERE id = ? LIMIT 1`,
        [id]
    );

    return terms[0];
};

const findByIds = async (ids) => {
    if (!ids.length) {
        return [];
    }

    const placeholders = ids.map(() => "?").join(", ");
    const [terms] = await connections.execute(
        `SELECT ${termFields} FROM cms_terms WHERE id IN (${placeholders}) ORDER BY taxonomy ASC, name ASC`,
        ids
    );

    return terms;
};

const findByTaxonomySlug = async (taxonomy, slug) => {
    const [terms] = await connections.execute(
        `SELECT ${termFields}
         FROM cms_terms
         WHERE taxonomy = ? AND slug = ?
         LIMIT 1`,
        [taxonomy, slug]
    );

    return terms[0];
};

const createTerm = async (term) => {
    const [result] = await connections.execute(
        `INSERT INTO cms_terms (
            taxonomy,
            name,
            slug,
            description,
            parent_id
        ) VALUES (?, ?, ?, ?, ?)`,
        [
            term.taxonomy,
            term.name,
            term.slug,
            term.description || null,
            term.parentId || null,
        ]
    );

    return findById(result.insertId);
};

const updateTerm = async (id, term) => {
    const [result] = await connections.execute(
        `UPDATE cms_terms
         SET taxonomy = ?,
             name = ?,
             slug = ?,
             description = ?,
             parent_id = ?
         WHERE id = ?`,
        [
            term.taxonomy,
            term.name,
            term.slug,
            term.description || null,
            term.parentId || null,
            id,
        ]
    );

    if (result.affectedRows === 0) {
        return undefined;
    }

    return findById(id);
};

const deleteTerm = async (id) => {
    const [result] = await connections.execute(
        "DELETE FROM cms_terms WHERE id = ?",
        [id]
    );

    return result;
};

const listTermsForPost = async (postId) => {
    const [terms] = await connections.execute(
        `SELECT ${termFields}
         FROM cms_terms
         INNER JOIN cms_post_terms ON cms_post_terms.term_id = cms_terms.id
         WHERE cms_post_terms.post_id = ?
         ORDER BY cms_terms.taxonomy ASC, cms_terms.name ASC`,
        [postId]
    );

    return terms;
};

const replacePostTerms = async (postId, termIds) => {
    const connection = await connections.getConnection();

    try {
        await connection.beginTransaction();
        await connection.execute("DELETE FROM cms_post_terms WHERE post_id = ?", [postId]);

        for (const termId of termIds) {
            await connection.execute(
                "INSERT INTO cms_post_terms (post_id, term_id) VALUES (?, ?)",
                [postId, termId]
            );
        }

        await connection.commit();
        return listTermsForPost(postId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const listPublishedPostsByTerm = async (taxonomy, slug) => {
    const [posts] = await connections.execute(
        `SELECT ${postFields}
         FROM cms_posts
         INNER JOIN cms_post_terms ON cms_post_terms.post_id = cms_posts.id
         INNER JOIN cms_terms ON cms_terms.id = cms_post_terms.term_id
         WHERE cms_posts.type = 'post'
            AND cms_posts.status = 'published'
            AND (cms_posts.published_at IS NULL OR cms_posts.published_at <= UTC_TIMESTAMP())
            AND cms_terms.taxonomy = ?
            AND cms_terms.slug = ?
         ORDER BY cms_posts.published_at DESC, cms_posts.updated_at DESC`,
        [taxonomy, slug]
    );

    return posts.map(mapPost);
};

module.exports = {
    createTerm,
    deleteTerm,
    findById,
    findByIds,
    findByTaxonomySlug,
    listPublishedPostsByTerm,
    listTerms,
    listTermsForPost,
    replacePostTerms,
    updateTerm,
};
