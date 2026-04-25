jest.mock("../../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

jest.mock("./postService", () => ({
    createPost: jest.fn(),
    deletePost: jest.fn(),
    getPostById: jest.fn(),
    getPostRevision: jest.fn(),
    getPostRevisions: jest.fn(),
    getPosts: jest.fn(),
    getPublishedPageBySlug: jest.fn(),
    getPublishedPostBySlug: jest.fn(),
    restorePostRevision: jest.fn(),
    updatePost: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../../app");
const postService = require("./postService");

const originalCmsEnabled = process.env.CMS_ENABLED;
const createHttpError = (statusCode, responseBody) => {
    const error = new Error("Request failed");
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const createTestApp = () => {
    process.env.CMS_ENABLED = "true";

    return createApp({
        sessionMiddleware: (req, res, next) => {
            req.session = {};
            next();
        },
    });
};

beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify.mockImplementation((token, secretOrCallback, maybeCallback) => {
        const callback = typeof secretOrCallback === "function" ? secretOrCallback : maybeCallback;
        const tokens = {
            "valid-token": { id: 1, isAdmin: true, exp: Math.floor(Date.now() / 1000) + 3600 },
            "regular-user-token": { id: 2, isAdmin: false, exp: Math.floor(Date.now() / 1000) + 3600 },
        };
        const decoded = tokens[token];

        if (!decoded) {
            const err = new Error("invalid token");
            if (callback) {
                return callback(err);
            }
            throw err;
        }

        if (callback) {
            return callback(null, decoded);
        }

        return decoded;
    });
});

afterEach(() => {
    process.env.CMS_ENABLED = originalCmsEnabled;
});

describe("CMS admin post routes", () => {
    it("requires authentication for admin post lists", async () => {
        const res = await request(createTestApp()).get("/api/cms/posts");

        expect(res.statusCode).toEqual(401);
        expect(postService.getPosts).not.toHaveBeenCalled();
    });

    it("requires admin access for admin post lists", async () => {
        const res = await request(createTestApp())
            .get("/api/cms/posts")
            .set("Cookie", "token=regular-user-token");

        expect(res.statusCode).toEqual(403);
        expect(postService.getPosts).not.toHaveBeenCalled();
    });

    it("returns posts to admins with query filters", async () => {
        const posts = [{ id: 1, type: "page", status: "draft", title: "Home" }];
        postService.getPosts.mockResolvedValue(posts);

        const res = await request(createTestApp())
            .get("/api/cms/posts?type=page&status=draft")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(posts);
        expect(postService.getPosts).toHaveBeenCalledWith({ type: "page", status: "draft" });
    });

    it("rejects invalid create payloads before calling the service", async () => {
        const res = await request(createTestApp())
            .post("/api/cms/posts")
            .set("Cookie", "token=valid-token")
            .send({ type: "page" });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: "Validation failed",
            errors: [
                { field: "title", message: "Title is required" },
                { field: "slug", message: "Slug is required" },
            ],
        });
        expect(postService.createPost).not.toHaveBeenCalled();
    });

    it("rejects unsupported content formats before calling the service", async () => {
        const res = await request(createTestApp())
            .post("/api/cms/posts")
            .set("Cookie", "token=valid-token")
            .send({
                type: "page",
                title: "Home",
                slug: "home",
                contentJson: {
                    format: "html",
                    html: "<h1>Home</h1>",
                },
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: "Validation failed",
            errors: [
                { field: "contentJson.format", message: "Content format must be markdown" },
                { field: "contentJson.markdown", message: "Markdown content must be a string" },
            ],
        });
        expect(postService.createPost).not.toHaveBeenCalled();
    });

    it("creates posts for admins", async () => {
        const payload = {
            type: "page",
            status: "draft",
            title: "Home",
            slug: "home",
            contentJson: { format: "markdown", markdown: "# Home" },
            contentHtml: "<h1>Home</h1>",
        };
        const createdPost = { id: 3, ...payload, authorId: 1 };
        postService.createPost.mockResolvedValue(createdPost);

        const res = await request(createTestApp())
            .post("/api/cms/posts")
            .set("Cookie", "token=valid-token")
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(createdPost);
        expect(postService.createPost).toHaveBeenCalledWith(payload, expect.objectContaining({ id: 1, isAdmin: true }));
    });

    it("updates posts for admins", async () => {
        const updatedPost = { id: 3, title: "Updated", slug: "updated" };
        postService.updatePost.mockResolvedValue(updatedPost);

        const res = await request(createTestApp())
            .put("/api/cms/posts/3")
            .set("Cookie", "token=valid-token")
            .send({ title: "Updated", slug: "updated" });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updatedPost);
        expect(postService.updatePost).toHaveBeenCalledWith("3", { title: "Updated", slug: "updated" }, expect.objectContaining({ id: 1, isAdmin: true }));
    });

    it("deletes posts for admins", async () => {
        postService.deletePost.mockResolvedValue();

        const res = await request(createTestApp())
            .delete("/api/cms/posts/3")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(204);
        expect(postService.deletePost).toHaveBeenCalledWith("3");
    });

    it("lists revisions for admins", async () => {
        const revisions = [{ id: 1, postId: 3, title: "Old title" }];
        postService.getPostRevisions.mockResolvedValue(revisions);

        const res = await request(createTestApp())
            .get("/api/cms/posts/3/revisions")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(revisions);
        expect(postService.getPostRevisions).toHaveBeenCalledWith("3");
    });

    it("returns a single revision for admins", async () => {
        const revision = { id: 2, postId: 3, title: "Older title" };
        postService.getPostRevision.mockResolvedValue(revision);

        const res = await request(createTestApp())
            .get("/api/cms/posts/3/revisions/2")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(revision);
        expect(postService.getPostRevision).toHaveBeenCalledWith("3", "2");
    });

    it("restores revisions for admins", async () => {
        const restoredPost = { id: 3, title: "Restored title", slug: "restored-title" };
        postService.restorePostRevision.mockResolvedValue(restoredPost);

        const res = await request(createTestApp())
            .post("/api/cms/posts/3/revisions/2/restore")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(restoredPost);
        expect(postService.restorePostRevision).toHaveBeenCalledWith("3", "2", expect.objectContaining({ id: 1, isAdmin: true }));
    });
});

describe("CMS public post routes", () => {
    it("returns published pages without authentication", async () => {
        const page = { id: 1, type: "page", status: "published", slug: "home" };
        postService.getPublishedPageBySlug.mockResolvedValue(page);

        const res = await request(createTestApp()).get("/api/cms/public/pages/home");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(page);
        expect(postService.getPublishedPageBySlug).toHaveBeenCalledWith("home");
    });

    it("returns published posts without authentication", async () => {
        const post = { id: 2, type: "post", status: "published", slug: "hello-world" };
        postService.getPublishedPostBySlug.mockResolvedValue(post);

        const res = await request(createTestApp()).get("/api/cms/public/posts/hello-world");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(post);
        expect(postService.getPublishedPostBySlug).toHaveBeenCalledWith("hello-world");
    });

    it("returns 404 for unpublished or missing public content", async () => {
        postService.getPublishedPageBySlug.mockRejectedValue(
            createHttpError(404, { message: "Published content not found." })
        );

        const res = await request(createTestApp()).get("/api/cms/public/pages/draft-page");

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: "Published content not found." });
    });
});
