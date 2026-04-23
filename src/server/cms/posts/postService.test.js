jest.mock("./postRepository", () => ({
    createPost: jest.fn(),
    createRevision: jest.fn(),
    deletePost: jest.fn(),
    findById: jest.fn(),
    findPublishedBySlug: jest.fn(),
    findRevisionById: jest.fn(),
    listPosts: jest.fn(),
    listRevisions: jest.fn(),
    updatePost: jest.fn(),
}));

const postRepository = require("./postRepository");
const postService = require("./postService");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("postService public content", () => {
    it("returns published pages by slug", async () => {
        const page = { id: 1, type: "page", status: "published", slug: "home" };
        postRepository.findPublishedBySlug.mockResolvedValue(page);

        await expect(postService.getPublishedPageBySlug("home")).resolves.toEqual(page);

        expect(postRepository.findPublishedBySlug).toHaveBeenCalledWith("page", "home");
    });

    it("returns published posts by slug", async () => {
        const post = { id: 2, type: "post", status: "published", slug: "hello-world" };
        postRepository.findPublishedBySlug.mockResolvedValue(post);

        await expect(postService.getPublishedPostBySlug("hello-world")).resolves.toEqual(post);

        expect(postRepository.findPublishedBySlug).toHaveBeenCalledWith("post", "hello-world");
    });

    it("hides missing or unpublished content from public requests", async () => {
        postRepository.findPublishedBySlug.mockResolvedValue(undefined);

        await expect(postService.getPublishedPageBySlug("draft-page"))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "Published content not found." },
            });
    });
});

describe("postService admin content", () => {
    it("creates posts with the authenticated author id", async () => {
        const payload = {
            type: "page",
            status: "draft",
            title: "Home",
            slug: "home",
            contentJson: { format: "markdown", markdown: "# Home" },
            contentHtml: "<h1>Home</h1>",
        };
        const createdPost = { id: 1, ...payload, authorId: 7 };
        postRepository.createPost.mockResolvedValue(createdPost);

        await expect(postService.createPost(payload, 7)).resolves.toEqual(createdPost);

        expect(postRepository.createPost).toHaveBeenCalledWith({
            ...payload,
            authorId: 7,
            contentHtml: "<h1>Home</h1>",
            contentJson: { format: "markdown", markdown: "# Home" },
            excerpt: undefined,
            menuOrder: 0,
            parentId: undefined,
            publishedAt: undefined,
            template: undefined,
        });
    });

    it("rejects invalid post types", async () => {
        await expect(postService.createPost({ type: "event", title: "Event", slug: "event" }, 7))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "Invalid CMS post type." },
            });

        expect(postRepository.createPost).not.toHaveBeenCalled();
    });

    it("updates existing posts and preserves omitted fields", async () => {
        const existingPost = {
            id: 1,
            type: "post",
            status: "draft",
            template: "default",
            title: "Old",
            slug: "old",
            authorId: 3,
            menuOrder: 0,
        };
        const updatedPost = { ...existingPost, title: "New" };
        postRepository.findById.mockResolvedValue(existingPost);
        postRepository.createRevision.mockResolvedValue({ id: 1, postId: 1, title: "Old" });
        postRepository.updatePost.mockResolvedValue(updatedPost);

        await expect(postService.updatePost(1, { title: "New" }, 7)).resolves.toEqual(updatedPost);

        expect(postRepository.createRevision).toHaveBeenCalledWith(1, existingPost, 7);
        expect(postRepository.updatePost).toHaveBeenCalledWith(1, expect.objectContaining({
            type: "post",
            status: "draft",
            title: "New",
            slug: "old",
            template: "default",
            menuOrder: 0,
        }));
    });

    it("returns 404 when deleting a missing post", async () => {
        postRepository.deletePost.mockResolvedValue({ affectedRows: 0 });

        await expect(postService.deletePost(99))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS post not found." },
            });
    });
});

describe("postService revisions", () => {
    it("lists revisions after confirming the post exists", async () => {
        const post = { id: 1, type: "page", status: "draft", title: "Home", slug: "home" };
        const revisions = [{ id: 5, postId: 1, title: "Old Home" }];
        postRepository.findById.mockResolvedValue(post);
        postRepository.listRevisions.mockResolvedValue(revisions);

        await expect(postService.getPostRevisions(1)).resolves.toEqual(revisions);

        expect(postRepository.findById).toHaveBeenCalledWith(1);
        expect(postRepository.listRevisions).toHaveBeenCalledWith(1);
    });

    it("returns 404 for missing revisions", async () => {
        postRepository.findById.mockResolvedValue({ id: 1, title: "Home" });
        postRepository.findRevisionById.mockResolvedValue(undefined);

        await expect(postService.getPostRevision(1, 99))
            .rejects
            .toMatchObject({
                statusCode: 404,
                responseBody: { message: "CMS revision not found." },
            });
    });

    it("creates a current snapshot before restoring a revision", async () => {
        const currentPost = {
            id: 1,
            type: "page",
            status: "published",
            title: "Current",
            slug: "current",
            template: "default",
            excerpt: "Current excerpt",
            contentJson: { format: "markdown", markdown: "# Current" },
            contentHtml: "<h1>Current</h1>",
            authorId: 3,
            menuOrder: 0,
        };
        const revision = {
            id: 2,
            postId: 1,
            status: "draft",
            title: "Restored",
            slug: "restored",
            template: "landing",
            excerpt: "Restored excerpt",
            contentJson: { format: "markdown", markdown: "# Restored" },
            contentHtml: "<h1>Restored</h1>",
        };
        const restoredPost = { ...currentPost, ...revision, id: 1 };
        postRepository.findById.mockResolvedValue(currentPost);
        postRepository.findRevisionById.mockResolvedValue(revision);
        postRepository.createRevision.mockResolvedValue({ id: 3, postId: 1, title: "Current" });
        postRepository.updatePost.mockResolvedValue(restoredPost);

        await expect(postService.restorePostRevision(1, 2, 7)).resolves.toEqual(restoredPost);

        expect(postRepository.createRevision).toHaveBeenCalledWith(1, currentPost, 7);
        expect(postRepository.updatePost).toHaveBeenCalledWith(1, expect.objectContaining({
            title: "Restored",
            slug: "restored",
            status: "draft",
            template: "landing",
            contentJson: { format: "markdown", markdown: "# Restored" },
            contentHtml: "<h1>Restored</h1>",
        }));
    });
});
