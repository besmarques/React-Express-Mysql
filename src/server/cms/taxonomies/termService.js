const { createHttpError } = require("../../config/errorResponses");
const postRepository = require("../posts/postRepository");
const termRepository = require("./termRepository");

const allowedTaxonomies = new Set(["category", "tag"]);

const normalizeTermInput = (payload, fallback = {}) => ({
    taxonomy: payload.taxonomy !== undefined ? payload.taxonomy : fallback.taxonomy,
    name: payload.name !== undefined ? payload.name : fallback.name,
    slug: payload.slug !== undefined ? payload.slug : fallback.slug,
    description: payload.description !== undefined ? payload.description : fallback.description,
    parentId: payload.parentId !== undefined ? payload.parentId : fallback.parentId,
});

const assertAllowedTaxonomy = (taxonomy) => {
    if (taxonomy !== undefined && !allowedTaxonomies.has(taxonomy)) {
        throw createHttpError(400, { message: "Invalid CMS taxonomy." });
    }
};

const assertPostExists = async (postId) => {
    const post = await postRepository.findById(postId);

    if (!post) {
        throw createHttpError(404, { message: "CMS post not found." });
    }

    return post;
};

const getTerms = async (filters = {}) => {
    assertAllowedTaxonomy(filters.taxonomy);
    return termRepository.listTerms(filters);
};

const getTermById = async (id) => {
    const term = await termRepository.findById(id);

    if (!term) {
        throw createHttpError(404, { message: "CMS term not found." });
    }

    return term;
};

const createTerm = async (payload) => {
    const term = normalizeTermInput(payload);
    assertAllowedTaxonomy(term.taxonomy);

    return termRepository.createTerm(term);
};

const updateTerm = async (id, payload) => {
    const existingTerm = await getTermById(id);
    const term = normalizeTermInput(payload, existingTerm);
    assertAllowedTaxonomy(term.taxonomy);

    const updatedTerm = await termRepository.updateTerm(id, term);

    if (!updatedTerm) {
        throw createHttpError(404, { message: "CMS term not found." });
    }

    return updatedTerm;
};

const deleteTerm = async (id) => {
    const result = await termRepository.deleteTerm(id);

    if (!result || result.affectedRows === 0) {
        throw createHttpError(404, { message: "CMS term not found." });
    }
};

const getPostTerms = async (postId) => {
    await assertPostExists(postId);
    return termRepository.listTermsForPost(postId);
};

const replacePostTerms = async (postId, termIds) => {
    await assertPostExists(postId);
    const uniqueTermIds = [...new Set(termIds.map(Number))];
    const terms = await termRepository.findByIds(uniqueTermIds);

    if (terms.length !== uniqueTermIds.length) {
        throw createHttpError(400, { message: "One or more CMS terms were not found." });
    }

    return termRepository.replacePostTerms(postId, uniqueTermIds);
};

const getPublicTerms = async (filters = {}) => getTerms(filters);

const getPublishedPostsByTerm = async (taxonomy, slug) => {
    assertAllowedTaxonomy(taxonomy);
    const term = await termRepository.findByTaxonomySlug(taxonomy, slug);

    if (!term) {
        throw createHttpError(404, { message: "CMS term not found." });
    }

    return termRepository.listPublishedPostsByTerm(taxonomy, slug);
};

module.exports = {
    createTerm,
    deleteTerm,
    getPostTerms,
    getPublicTerms,
    getPublishedPostsByTerm,
    getTermById,
    getTerms,
    replacePostTerms,
    updateTerm,
};
