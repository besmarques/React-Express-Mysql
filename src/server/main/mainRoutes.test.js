jest.mock("../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mainRoutes = require("./mainRoutes");

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use("/api", mainRoutes);

    return app;
};

const app = createApp();

beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify.mockImplementation((token) => {
        if (token === "valid-token") {
            return { isAdmin: true };
        }

        throw new Error("invalid token");
    });
});

describe("GET /api/", () => {
    it("should return 401 Unauthorized if no authentication is provided", async () => {
        const res = await request(app).get("/api/");
        expect(res.statusCode).toEqual(401);
    });

    it("should return 200 OK if a valid token is provided", async () => {
        const token = jwt.sign({ isAdmin: true });
        const res = await request(app).get("/api/").set("Cookie", `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual("Hello World !!!!!");
    });
});

describe('GET /api/env', () => {
    it('should return 401 Unauthorized if no authentication is provided', async () => {
        const res = await request(app).get('/api/env');
        expect(res.statusCode).toEqual(401);
    });

    it('should return the environment variables if a valid token is provided', async () => {
        const token = jwt.sign({ isAdmin: true });
        const res = await request(app).get('/api/env').set('Cookie', `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            REACT_APP_BASENAME: process.env.REACT_APP_BASENAME,
            REACT_APP_STATUS_MESSAGE: process.env.REACT_APP_STATUS_MESSAGE
        });
    });
});

describe('GET /api/auth-status', () => {
    it('should return isAuthenticated: false if no token is provided', async () => {
        const res = await request(app).get('/api/auth-status');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ isAuthenticated: false });
    });

    it('should return isAuthenticated: false if an invalid token is provided', async () => {
        const res = await request(app).get('/api/auth-status').set('Cookie', `token=invalidtoken`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ isAuthenticated: false });
    });

    it('should return isAuthenticated: true if a valid token is provided', async () => {
        const token = jwt.sign({ isAdmin: true });
        const res = await request(app).get('/api/auth-status').set('Cookie', `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ isAuthenticated: true, isAdmin: true });
    });
});
