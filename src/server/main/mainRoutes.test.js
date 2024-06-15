const request = require("supertest");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const PORT = process.env.APP_PORT || 8080; // Define PORT
const secretKey = process.env.JWT_SECRET; // Define secret key
const server = `http://localhost:${PORT}`;

describe("GET /api/", () => {
    it("should return 401 Unauthorized if no authentication is provided", async () => {
        const res = await request(server).get("/api/");
        expect(res.statusCode).toEqual(401);
    });

    it("should return 200 OK if a valid token is provided", async () => {
        const token = jwt.sign({ isAdmin: true }, secretKey); // replace with your secret key
        const res = await request(server).get("/api/").set("Cookie", `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual("Hello World !!!!!");
    });
});

describe('GET /api/env', () => {
    it('should return 401 Unauthorized if no authentication is provided', async () => {
        const res = await request(server).get('/api/env');
        expect(res.statusCode).toEqual(401);
    });

    it('should return the environment variables if a valid token is provided', async () => {
        const token = jwt.sign({ isAdmin: true }, secretKey); // replace with your secret key
        const res = await request(server).get('/api/env').set('Cookie', `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            REACT_APP_BASENAME: process.env.REACT_APP_BASENAME,
            REACT_APP_TESTE: process.env.REACT_APP_TESTE
        });
    });
});

describe('GET /api/auth-status', () => {
    it('should return isAuthenticated: false if no token is provided', async () => {
        const res = await request(server).get('/api/auth-status');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ isAuthenticated: false });
    });

    it('should return isAuthenticated: false if an invalid token is provided (response comes from autoRenewtoken)', async () => {
        const res = await request(server).get('/api/auth-status').set('Cookie', `token=invalidtoken`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ message: "Unauthorized: Invalid token" });
    });

    it('should return isAuthenticated: true if a valid token is provided', async () => {
        const token = jwt.sign({ isAdmin: true }, secretKey); // replace with your secret key
        const res = await request(server).get('/api/auth-status').set('Cookie', `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ isAuthenticated: true, isAdmin: true });
    });
});