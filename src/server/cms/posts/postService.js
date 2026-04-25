const postRepository = require("./postRepository");
const { permissions } = require("../permissions/permissionConstants");

const allowedTypes = new Set(["post", "page"]);
const allowedStatuses = new Set(["draft", "published", "private", "trash"]);

const createHttpError = (statusCode, responseBody, message) => {
    const error = new Error(message || responseBody.message || responseBody);
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const normalizePostInput = (payload, fallback = {}) => ({
    type: payload.type || fallback.type || "post",
    status: payload.status || fallback.status || "draft",
    title: payload.title !== undefined ? payload.title : fallback.title,
    slug: payload.slug !== undefined ? payload.slug : fallback.slug,
    template: payload.template !== undefined ? payload.template : fallback.template,
    excerpt: payload.excerpt !== undefined ? payload.excerpt : fallback.excerpt,
    contentJson: payload.contentJson !== undefined ? payload.contentJson : fallback.contentJson,
    contentHtml: payload.contentHtml !== undefined ? payload.contentHtml : fallback.contentHtml,
    parentId: payload.parentId !== undefined ? payload.parentId : fallback.parentId,
    menuOrder: payload.menuOrder !== undefined ? payload.menuOrder : fallback.menuOrder || 0,
    publishedAt: payload.publishedAt !== undefined ? payload.publishedAt : fallback.publishedAt,
});

const assertAllowedPost = (post) => {
    if (!allowedTypes.has(post.type)) {
        throw createHttpError(400, { message: "Invalid CMS post type." });
    }

    if (!allowedStatuses.has(post.status)) {
        throw createHttpError(400, { message: "Invalid CMS post status." });
    }
};

const hasPermission = (user, permission) => (
    Boolean(user && user.isAdmin)
        || Boolean(user && Array.isArray(user.permissions) && user.permissions.includes(permission))
);

const assertPublishPermission = (post, user) => {
    if (post.status === "published" && !hasPermission(user, permissions.cmsPostsPublish)) {
        throw createHttpError(403, { message: "Forbidden: Publish permission required." });
    }
};

const getPosts = async (filters = {}) => postRepository.listPosts(filters);

const getPostById = async (id) => {
    const post = await postRepository.findById(id);

    if (!post) {
        throw createHttpError(404, { message: "CMS post not found." });
    }

    return post;
};

const createPost = async (payload, user) => {
    const post = normalizePostInput(payload);
    assertAllowedPost(post);
    assertPublishPermission(post, user);

    return postRepository.createPost({
        ...post,
        authorId: user.id,
    });
};

const updatePost = async (id, payload, user) => {
    const existingPost = await getPostById(id);
    const post = normalizePostInput(payload, existingPost);
    assertAllowedPost(post);
    assertPublishPermission(post, user);

    await postRepository.createRevision(id, existingPost, user.id ?? existingPost.authorId);
    const updatedPost = await postRepository.updatePost(id, post);

    if (!updatedPost) {
        throw createHttpError(404, { message: "CMS post not found." });
    }

    return updatedPost;
};

const deletePost = async (id) => {
    const result = await postRepository.deletePost(id);

    if (!result || result.affectedRows === 0) {
        throw createHttpError(404, { message: "CMS post not found." });
    }
};

const getPublishedBySlug = async (type, slug) => {
    const post = await postRepository.findPublishedBySlug(type, slug);

    if (!post) {
        throw createHttpError(404, { message: "Published content not found." });
    }

    return post;
};

const getPublishedPageBySlug = async (slug) => getPublishedBySlug("page", slug);
const getPublishedPostBySlug = async (slug) => getPublishedBySlug("post", slug);

const getPostRevision = async (postId, revisionId) => {
    await getPostById(postId);
    const revision = await postRepository.findRevisionById(postId, revisionId);

    if (!revision) {
        throw createHttpError(404, { message: "CMS revision not found." });
    }

    return revision;
};

const getPostRevisions = async (postId) => {
    await getPostById(postId);
    return postRepository.listRevisions(postId);
};

const restorePostRevision = async (postId, revisionId, user) => {
    const existingPost = await getPostById(postId);
    const revision = await getPostRevision(postId, revisionId);
    assertPublishPermission({ status: revision.status }, user);

    await postRepository.createRevision(postId, existingPost, user.id);

    const restoredPost = await postRepository.updatePost(postId, {
        ...existingPost,
        title: revision.title,
        slug: revision.slug,
        template: revision.template,
        excerpt: revision.excerpt,
        contentJson: revision.contentJson,
        contentHtml: revision.contentHtml,
        status: revision.status,
    });

    if (!restoredPost) {
        throw createHttpError(404, { message: "CMS post not found." });
    }

    return restoredPost;
};

module.exports = {
    createPost,
    deletePost,
    getPostById,
    getPostRevision,
    getPostRevisions,
    getPosts,
    getPublishedPageBySlug,
    getPublishedPostBySlug,
    restorePostRevision,
    updatePost,
};
