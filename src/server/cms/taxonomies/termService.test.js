jest.mock("../posts/postRepository", () => ({
    findById: jest.fn(),
}));

jest.mock("./termRepository", () => ({
    createTerm: jest.fn(),
    deleteTerm: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByTaxonomySlug: jest.fn(),
    listPublishedPostsByTerm: jest.fn(),
    listTerms: jest.fn(),
    listTermsForPost: jest.fn(),
    replacePostTerms: jest.fn(),
    updateTerm: jest.fn(),
}));

const postRepository = require("../posts/postRepository");
const termRepository = require("./termRepository");
const termService = require("./termService");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("termService admin terms", () => {
    it("lists terms with an optional taxonomy filter", async () => {
        const terms = [{ id: 1, taxonomy: "category", name: "News", slug: "news" }];
        termRepository.listTerms.mockResolvedValue(terms);

        await expect(termService.getTerms({ taxonomy: "category" })).resolves.toEqual(terms);

        expect(termRepository.listTerms).toHaveBeenCalledWith({ taxonomy: "category" });
    });

    it("rejects unsupported taxonomy filters", async () => {
        await expect(termService.getTerms({ taxonomy: "series" }))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "Invalid CMS taxonomy." },
            });

        expect(termRepository.listTerms).not.toHaveBeenCalled();
    });

    it("creates terms with supported taxonomies", async () => {
        const payload = { taxonomy: "tag", name: "React", slug: "react" };
        const createdTerm = { id: 2, ...payload };
        termRepository.createTerm.mockResolvedValue(createdTerm);

        await expect(termService.createTerm(payload)).resolves.toEqual(createdTerm);

        expect(termRepository.createTerm).toHaveBeenCalledWith({
            ...payload,
            description: undefined,
            parentId: undefined,
        });
    });

    it("updates existing terms and preserves omitted fields", async () => {
        const existingTerm = { id: 1, taxonomy: "category", name: "Old", slug: "old", description: null };
        const updatedTerm = { ...existingTerm, name: "New" };
        termRepository.findById.mockResolvedValue(existingTerm);
        termRepository.updateTerm.mockResolvedValue(updatedTerm);

        await expect(termService.updateTerm(1, { name: "New" })).resolves.toEqual(updatedTerm);

        expect(termRepository.updateTerm).toHaveBeenCalledWith(1, {
            taxonomy: "category",
            name: "New",
            slug: "old",
            description: null,
            parentId: undefined,
        });
    });

    it("returns 404 when deleting a missing term", async () => {
        termRepository.deleteTerm.mockResolvedValue({ affectedRows: 0 });

        await expect(termService.deleteTerm(99))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS term not found." },
            });
    });
});

describe("termService post assignments", () => {
    it("lists terms after confirming the post exists", async () => {
        const terms = [{ id: 1, taxonomy: "category", slug: "news" }];
        postRepository.findById.mockResolvedValue({ id: 7, title: "Post" });
        termRepository.listTermsForPost.mockResolvedValue(terms);

        await expect(termService.getPostTerms(7)).resolves.toEqual(terms);

        expect(postRepository.findById).toHaveBeenCalledWith(7);
        expect(termRepository.listTermsForPost).toHaveBeenCalledWith(7);
    });

    it("deduplicates assigned terms and returns the replacement set", async () => {
        const assignedTerms = [{ id: 1, taxonomy: "category", slug: "news" }];
        postRepository.findById.mockResolvedValue({ id: 7, title: "Post" });
        termRepository.findByIds.mockResolvedValue(assignedTerms);
        termRepository.replacePostTerms.mockResolvedValue(assignedTerms);

        await expect(termService.replacePostTerms(7, [1, "1"])).resolves.toEqual(assignedTerms);

        expect(termRepository.findByIds).toHaveBeenCalledWith([1]);
        expect(termRepository.replacePostTerms).toHaveBeenCalledWith(7, [1]);
    });

    it("rejects assignments for missing terms", async () => {
        postRepository.findById.mockResolvedValue({ id: 7, title: "Post" });
        termRepository.findByIds.mockResolvedValue([{ id: 1, taxonomy: "category", slug: "news" }]);

        await expect(termService.replacePostTerms(7, [1, 2]))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "One or more CMS terms were not found." },
            });

        expect(termRepository.replacePostTerms).not.toHaveBeenCalled();
    });

    it("returns 404 for missing posts before assignment", async () => {
        postRepository.findById.mockResolvedValue(undefined);

        await expect(termService.replacePostTerms(7, [1]))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS post not found." },
            });

        expect(termRepository.findByIds).not.toHaveBeenCalled();
    });
});

describe("termService public filtering", () => {
    it("returns published posts for an existing term", async () => {
        const posts = [{ id: 1, type: "post", status: "published", slug: "hello" }];
        termRepository.findByTaxonomySlug.mockResolvedValue({ id: 3, taxonomy: "tag", slug: "react" });
        termRepository.listPublishedPostsByTerm.mockResolvedValue(posts);

        await expect(termService.getPublishedPostsByTerm("tag", "react")).resolves.toEqual(posts);

        expect(termRepository.findByTaxonomySlug).toHaveBeenCalledWith("tag", "react");
        expect(termRepository.listPublishedPostsByTerm).toHaveBeenCalledWith("tag", "react");
    });

    it("returns 404 when the public term does not exist", async () => {
        termRepository.findByTaxonomySlug.mockResolvedValue(undefined);

        await expect(termService.getPublishedPostsByTerm("category", "missing"))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS term not found." },
            });

        expect(termRepository.listPublishedPostsByTerm).not.toHaveBeenCalled();
    });
});
