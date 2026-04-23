jest.mock("../../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

jest.mock("./termService", () => ({
    createTerm: jest.fn(),
    deleteTerm: jest.fn(),
    getPostTerms: jest.fn(),
    getPublicTerms: jest.fn(),
    getPublishedPostsByTerm: jest.fn(),
    getTermById: jest.fn(),
    getTerms: jest.fn(),
    replacePostTerms: jest.fn(),
    updateTerm: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../../app");
const termService = require("./termService");

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

describe("CMS admin term routes", () => {
    it("requires authentication for admin term lists", async () => {
        const res = await request(createTestApp()).get("/api/cms/terms");

        expect(res.statusCode).toEqual(401);
        expect(termService.getTerms).not.toHaveBeenCalled();
    });

    it("requires admin access for admin term lists", async () => {
        const res = await request(createTestApp())
            .get("/api/cms/terms")
            .set("Cookie", "token=regular-user-token");

        expect(res.statusCode).toEqual(403);
        expect(termService.getTerms).not.toHaveBeenCalled();
    });

    it("returns terms to admins with query filters", async () => {
        const terms = [{ id: 1, taxonomy: "category", name: "News", slug: "news" }];
        termService.getTerms.mockResolvedValue(terms);

        const res = await request(createTestApp())
            .get("/api/cms/terms?taxonomy=category")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(terms);
        expect(termService.getTerms).toHaveBeenCalledWith({ taxonomy: "category" });
    });

    it("rejects invalid create payloads before calling the service", async () => {
        const res = await request(createTestApp())
            .post("/api/cms/terms")
            .set("Cookie", "token=valid-token")
            .send({ taxonomy: "series" });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: "Validation failed",
            errors: [
                { field: "taxonomy", message: "Taxonomy must be category or tag" },
                { field: "name", message: "Name is required" },
                { field: "slug", message: "Slug is required" },
            ],
        });
        expect(termService.createTerm).not.toHaveBeenCalled();
    });

    it("creates terms for admins", async () => {
        const payload = { taxonomy: "tag", name: "React", slug: "react" };
        const createdTerm = { id: 2, ...payload };
        termService.createTerm.mockResolvedValue(createdTerm);

        const res = await request(createTestApp())
            .post("/api/cms/terms")
            .set("Cookie", "token=valid-token")
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(createdTerm);
        expect(termService.createTerm).toHaveBeenCalledWith(payload);
    });

    it("updates terms for admins", async () => {
        const updatedTerm = { id: 2, taxonomy: "tag", name: "React Router", slug: "react-router" };
        termService.updateTerm.mockResolvedValue(updatedTerm);

        const res = await request(createTestApp())
            .put("/api/cms/terms/2")
            .set("Cookie", "token=valid-token")
            .send({ name: "React Router", slug: "react-router" });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updatedTerm);
        expect(termService.updateTerm).toHaveBeenCalledWith("2", { name: "React Router", slug: "react-router" });
    });

    it("deletes terms for admins", async () => {
        termService.deleteTerm.mockResolvedValue();

        const res = await request(createTestApp())
            .delete("/api/cms/terms/2")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(204);
        expect(termService.deleteTerm).toHaveBeenCalledWith("2");
    });

    it("lists assigned post terms for admins", async () => {
        const terms = [{ id: 1, taxonomy: "category", slug: "news" }];
        termService.getPostTerms.mockResolvedValue(terms);

        const res = await request(createTestApp())
            .get("/api/cms/posts/7/terms")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(terms);
        expect(termService.getPostTerms).toHaveBeenCalledWith("7");
    });

    it("replaces assigned post terms for admins", async () => {
        const terms = [{ id: 1, taxonomy: "category", slug: "news" }];
        termService.replacePostTerms.mockResolvedValue(terms);

        const res = await request(createTestApp())
            .put("/api/cms/posts/7/terms")
            .set("Cookie", "token=valid-token")
            .send({ termIds: [1] });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(terms);
        expect(termService.replacePostTerms).toHaveBeenCalledWith("7", [1]);
    });

    it("rejects invalid post term assignment payloads", async () => {
        const res = await request(createTestApp())
            .put("/api/cms/posts/7/terms")
            .set("Cookie", "token=valid-token")
            .send({ termIds: [""] });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: "Validation failed",
            errors: [{ field: "termIds", message: "Term ids must be integers" }],
        });
        expect(termService.replacePostTerms).not.toHaveBeenCalled();
    });
});

describe("CMS public term routes", () => {
    it("returns public terms without authentication", async () => {
        const terms = [{ id: 1, taxonomy: "category", name: "News", slug: "news" }];
        termService.getPublicTerms.mockResolvedValue(terms);

        const res = await request(createTestApp()).get("/api/cms/public/terms?taxonomy=category");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(terms);
        expect(termService.getPublicTerms).toHaveBeenCalledWith({ taxonomy: "category" });
    });

    it("returns published posts for a public term without authentication", async () => {
        const posts = [{ id: 1, type: "post", status: "published", slug: "hello" }];
        termService.getPublishedPostsByTerm.mockResolvedValue(posts);

        const res = await request(createTestApp()).get("/api/cms/public/terms/tag/react/posts");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(posts);
        expect(termService.getPublishedPostsByTerm).toHaveBeenCalledWith("tag", "react");
    });

    it("returns 404 for missing public terms", async () => {
        termService.getPublishedPostsByTerm.mockRejectedValue(
            createHttpError(404, { message: "CMS term not found." })
        );

        const res = await request(createTestApp()).get("/api/cms/public/terms/category/missing/posts");

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: "CMS term not found." });
    });
});
