jest.mock("../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

const request = require("supertest");
const createApp = require("../app");
const { isCmsEnabled } = require("./cmsConfig");

const originalCmsEnabled = process.env.CMS_ENABLED;
const sessionMiddleware = (req, res, next) => {
    req.session = {};
    next();
};

describe("cmsConfig", () => {
    it("treats CMS_ENABLED as disabled by default", () => {
        expect(isCmsEnabled({})).toEqual(false);
        expect(isCmsEnabled({ CMS_ENABLED: "false" })).toEqual(false);
        expect(isCmsEnabled({ CMS_ENABLED: "" })).toEqual(false);
    });

    it("accepts common truthy CMS_ENABLED values", () => {
        expect(isCmsEnabled({ CMS_ENABLED: "true" })).toEqual(true);
        expect(isCmsEnabled({ CMS_ENABLED: "1" })).toEqual(true);
        expect(isCmsEnabled({ CMS_ENABLED: "yes" })).toEqual(true);
        expect(isCmsEnabled({ CMS_ENABLED: "on" })).toEqual(true);
    });
});

describe("optional CMS module", () => {
    afterEach(() => {
        process.env.CMS_ENABLED = originalCmsEnabled;
    });

    it("does not register CMS routes when CMS is disabled", async () => {
        process.env.CMS_ENABLED = "false";
        const app = createApp({ sessionMiddleware });

        const res = await request(app).get("/api/cms/health");

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: "API route not found" });
    });

    it("registers CMS routes when CMS is enabled", async () => {
        process.env.CMS_ENABLED = "true";
        const app = createApp({ sessionMiddleware });

        const res = await request(app).get("/api/cms/health");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            status: "ok",
            module: "cms",
        });
    });
});
