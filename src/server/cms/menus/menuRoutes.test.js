jest.mock("../../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

jest.mock("./menuService", () => ({
    createMenu: jest.fn(),
    createMenuItem: jest.fn(),
    deleteMenu: jest.fn(),
    deleteMenuItem: jest.fn(),
    getMenuItems: jest.fn(),
    getMenuItemTargets: jest.fn(),
    getMenuWithItems: jest.fn(),
    getMenus: jest.fn(),
    getPublicMenuByLocation: jest.fn(),
    updateMenu: jest.fn(),
    updateMenuItem: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../../app");
const menuService = require("./menuService");

const originalCmsEnabled = process.env.CMS_ENABLED;
const validationErrorResponse = (errors) => ({
    code: "VALIDATION_ERROR",
    message: "Please correct the highlighted fields and try again.",
    errors,
});
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

describe("CMS admin menu routes", () => {
    it("requires authentication for menu lists", async () => {
        const res = await request(createTestApp()).get("/api/cms/menus");

        expect(res.statusCode).toEqual(401);
        expect(menuService.getMenus).not.toHaveBeenCalled();
    });

    it("requires admin access for menu lists", async () => {
        const res = await request(createTestApp())
            .get("/api/cms/menus")
            .set("Cookie", "token=regular-user-token");

        expect(res.statusCode).toEqual(403);
        expect(menuService.getMenus).not.toHaveBeenCalled();
    });

    it("returns menus to admins", async () => {
        const menus = [{ id: 1, name: "Primary", slug: "primary" }];
        menuService.getMenus.mockResolvedValue(menus);

        const res = await request(createTestApp())
            .get("/api/cms/menus")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(menus);
    });

    it("returns menu item targets to admins", async () => {
        const targets = [{ id: 1, label: "Home", slug: "home", status: "published" }];
        menuService.getMenuItemTargets.mockResolvedValue(targets);

        const res = await request(createTestApp())
            .get("/api/cms/menus/item-targets?itemType=page")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(targets);
        expect(menuService.getMenuItemTargets).toHaveBeenCalledWith("page");
    });

    it("rejects invalid create payloads before calling the service", async () => {
        const res = await request(createTestApp())
            .post("/api/cms/menus")
            .set("Cookie", "token=valid-token")
            .send({ slug: "" });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual(validationErrorResponse([
            { field: "name", message: "Name is required" },
            { field: "slug", message: "Slug is required" },
        ]));
        expect(menuService.createMenu).not.toHaveBeenCalled();
    });

    it("creates menus for admins", async () => {
        const payload = { name: "Primary", slug: "primary", location: "primary" };
        const createdMenu = { id: 1, ...payload };
        menuService.createMenu.mockResolvedValue(createdMenu);

        const res = await request(createTestApp())
            .post("/api/cms/menus")
            .set("Cookie", "token=valid-token")
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(createdMenu);
        expect(menuService.createMenu).toHaveBeenCalledWith(payload);
    });

    it("updates menus for admins", async () => {
        const updatedMenu = { id: 1, name: "Header", slug: "header" };
        menuService.updateMenu.mockResolvedValue(updatedMenu);

        const res = await request(createTestApp())
            .put("/api/cms/menus/1")
            .set("Cookie", "token=valid-token")
            .send({ name: "Header", slug: "header" });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updatedMenu);
        expect(menuService.updateMenu).toHaveBeenCalledWith("1", { name: "Header", slug: "header" });
    });

    it("deletes menus for admins", async () => {
        menuService.deleteMenu.mockResolvedValue();

        const res = await request(createTestApp())
            .delete("/api/cms/menus/1")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(204);
        expect(menuService.deleteMenu).toHaveBeenCalledWith("1");
    });
});

describe("CMS admin menu item routes", () => {
    it("lists menu items for admins", async () => {
        const items = [{ id: 1, menuId: 2, label: "Home" }];
        menuService.getMenuItems.mockResolvedValue(items);

        const res = await request(createTestApp())
            .get("/api/cms/menus/2/items")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(items);
        expect(menuService.getMenuItems).toHaveBeenCalledWith("2");
    });

    it("rejects invalid item payloads before calling the service", async () => {
        const res = await request(createTestApp())
            .post("/api/cms/menus/2/items")
            .set("Cookie", "token=valid-token")
            .send({ itemType: "unknown", sortOrder: "x" });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual(validationErrorResponse([
            { field: "label", message: "Label is required" },
            { field: "itemType", message: "Item type must be custom, page, post, category, or tag" },
            { field: "sortOrder", message: "Sort order must be an integer" },
        ]));
        expect(menuService.createMenuItem).not.toHaveBeenCalled();
    });

    it("creates menu items for admins", async () => {
        const payload = { label: "Home", itemType: "page", targetId: 4, sortOrder: 0 };
        const item = { id: 1, menuId: 2, ...payload };
        menuService.createMenuItem.mockResolvedValue(item);

        const res = await request(createTestApp())
            .post("/api/cms/menus/2/items")
            .set("Cookie", "token=valid-token")
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual(item);
        expect(menuService.createMenuItem).toHaveBeenCalledWith("2", payload);
    });

    it("updates menu items for admins", async () => {
        const item = { id: 1, menuId: 2, label: "Start" };
        menuService.updateMenuItem.mockResolvedValue(item);

        const res = await request(createTestApp())
            .put("/api/cms/menus/2/items/1")
            .set("Cookie", "token=valid-token")
            .send({ label: "Start" });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(item);
        expect(menuService.updateMenuItem).toHaveBeenCalledWith("2", "1", { label: "Start" });
    });

    it("deletes menu items for admins", async () => {
        menuService.deleteMenuItem.mockResolvedValue();

        const res = await request(createTestApp())
            .delete("/api/cms/menus/2/items/1")
            .set("Cookie", "token=valid-token");

        expect(res.statusCode).toEqual(204);
        expect(menuService.deleteMenuItem).toHaveBeenCalledWith("2", "1");
    });
});

describe("CMS public menu routes", () => {
    it("returns public menus without authentication", async () => {
        const menu = {
            id: 1,
            name: "Primary",
            location: "primary",
            items: [{ id: 1, label: "Home", url: "/home" }],
        };
        menuService.getPublicMenuByLocation.mockResolvedValue(menu);

        const res = await request(createTestApp()).get("/api/cms/public/menus/primary");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(menu);
        expect(menuService.getPublicMenuByLocation).toHaveBeenCalledWith("primary");
    });

    it("returns 404 for missing public menus", async () => {
        menuService.getPublicMenuByLocation.mockRejectedValue(
            createHttpError(404, { message: "CMS menu not found." })
        );

        const res = await request(createTestApp()).get("/api/cms/public/menus/missing");

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            code: "NOT_FOUND",
            message: "CMS menu not found.",
        });
    });
});
