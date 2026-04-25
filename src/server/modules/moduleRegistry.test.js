jest.mock("../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

const request = require("supertest");
const createApp = require("../app");
const { getEnabledServerModules } = require("./moduleRegistry");

const originalCmsEnabled = process.env.CMS_ENABLED;
const sessionMiddleware = (req, res, next) => {
    req.session = {};
    next();
};

describe("server module registry", () => {
    afterEach(() => {
        process.env.CMS_ENABLED = originalCmsEnabled;
    });

    it("returns no enabled modules by default", () => {
        expect(getEnabledServerModules({})).toEqual([]);
        expect(getEnabledServerModules({ CMS_ENABLED: "false" })).toEqual([]);
    });

    it("returns the cms module when enabled", () => {
        expect(getEnabledServerModules({ CMS_ENABLED: "true" }).map((moduleDefinition) => moduleDefinition.name)).toEqual(["cms"]);
    });

    it("registers enabled module routes through the app registry", async () => {
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
