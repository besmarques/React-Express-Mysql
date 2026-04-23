jest.mock("../../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

jest.mock("./mediaService", () => ({
    deleteMedia: jest.fn(),
    getMedia: jest.fn(),
    getMediaById: jest.fn(),
    updateMedia: jest.fn(),
    uploadMedia: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../../app");
const mediaService = require("./mediaService");

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

describe("CMS admin media routes", () => {
    it("requires authentication for media lists", async () => {
        const res = await request(createTestApp()).get("/api/cms/media");

        expect(res.statusCode).toEqual(401);
        expect(mediaService.getMedia).not.toHaveBeenCalled();
    });

    it("requires admin access for media lists", async () => {
        const res = await request(createTestApp())
            .get("/api/cms/media")
            .set("Cookie", "token=regular-user-token");

        expect(res.statusCode).toEqual(403);
        expect(mediaService.getMedia).not.toHaveBeenCalled();
    });

    it("returns media to admins with query filters", async () => {
        const media = [{ id: 1, mimeType: "image/png", url: "/media/cms/file.png" }];
        mediaService.getMedia.mockResolvedValue(media);

        const res = await request(createTestApp())
            .get("/api/cms/media?mimeType=image/png")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(media);
        expect(mediaService.getMedia).toHaveBeenCalledWith({ mimeType: "image/png" });
    });

    it("rejects invalid upload payloads before calling the service", async () => {
        const res = await request(createTestApp())
            .post("/api/cms/media")
            .set("Cookie", "token=valid-token")
            .send({ mimeType: "image/png" });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: "Validation failed",
            errors: [
                { field: "originalName", message: "Original name is required" },
                { field: "data", message: "File data is required" },
            ],
        });
        expect(mediaService.uploadMedia).not.toHaveBeenCalled();
    });

    it("uploads media for admins", async () => {
        const payload = {
            data: Buffer.from("hello").toString("base64"),
            mimeType: "image/png",
            originalName: "image.png",
        };
        const createdMedia = { id: 1, ...payload, url: "/media/cms/image.png" };
        mediaService.uploadMedia.mockResolvedValue(createdMedia);

        const res = await request(createTestApp())
            .post("/api/cms/media")
            .set("Cookie", "token=valid-token")
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(createdMedia);
        expect(mediaService.uploadMedia).toHaveBeenCalledWith(payload, 1);
    });

    it("updates media metadata for admins", async () => {
        const updatedMedia = { id: 1, altText: "Alt", caption: "Caption" };
        mediaService.updateMedia.mockResolvedValue(updatedMedia);

        const res = await request(createTestApp())
            .put("/api/cms/media/1")
            .set("Cookie", "token=valid-token")
            .send({ altText: "Alt", caption: "Caption" });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updatedMedia);
        expect(mediaService.updateMedia).toHaveBeenCalledWith("1", { altText: "Alt", caption: "Caption" });
    });

    it("deletes media for admins", async () => {
        mediaService.deleteMedia.mockResolvedValue();

        const res = await request(createTestApp())
            .delete("/api/cms/media/1")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(204);
        expect(mediaService.deleteMedia).toHaveBeenCalledWith("1");
    });

    it("returns service errors", async () => {
        mediaService.getMediaById.mockRejectedValue(
            createHttpError(404, { message: "CMS media not found." })
        );

        const res = await request(createTestApp())
            .get("/api/cms/media/99")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: "CMS media not found." });
    });
});
