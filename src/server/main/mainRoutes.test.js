jest.mock("../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../app");

const createTestApp = () => createApp({
    sessionMiddleware: (req, res, next) => {
        req.session = {};
        next();
    },
});

const app = createTestApp();

beforeEach(() => {
    jest.clearAllMocks();
    const verifyToken = (token) => {
        if (token === "valid-token") {
            return { id: 1, isAdmin: true, exp: Math.floor(Date.now() / 1000) + 3600 };
        }

        throw new Error("invalid token");
    };

    jwt.verify.mockImplementation((token, secretOrCallback, maybeCallback) => {
        const callback = typeof secretOrCallback === "function" ? secretOrCallback : maybeCallback;

        try {
            const decoded = verifyToken(token);
            if (callback) {
                return callback(null, decoded);
            }
            return decoded;
        } catch (err) {
            if (callback) {
                return callback(err);
            }
            throw err;
        }
    });
});

describe("GET /api/health", () => {
    it("should return 200 OK without authentication", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});

describe('GET /api/env', () => {
    it('should return frontend environment values without authentication', async () => {
        const res = await request(app).get('/api/env');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
            CMS_ENABLED: ["true", "1", "yes", "on"].includes(String(process.env.CMS_ENABLED || "").trim().toLowerCase()),
            CMS_THEME: process.env.CMS_THEME || "default"
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
