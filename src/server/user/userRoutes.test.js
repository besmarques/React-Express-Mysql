const request = require("supertest");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const PORT = process.env.APP_PORT || 8080; // Define PORT
const secretKey = process.env.JWT_SECRET; // Define secret key
const server = `http://localhost:${PORT}`;
const bcrypt = require('bcrypt');
const db = require('../config/dbpool');

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

describe("GET /api/users", () => {
    it("should return 401 Unauthorized if no authentication is provided", async () => {
        const res = await request(server).get("/api/users");
        expect(res.statusCode).toEqual(401);
    });

    it("should return 200 OK if a valid token is provided", async () => {
        const token = jwt.sign({ isAdmin: true }, secretKey); // replace with your secret key
        const res = await request(server).get("/api/users").set("Cookie", `token=${token}`);
        expect(res.statusCode).toEqual(200);
    });
}); 

describe('POST /api/login', () => {

    it('should return 401 Bad Request if no user with that email is found', async () => {
        const res = await request(server).post('/api/login').send({ email: 'nonexistent@example.com', password: 'password' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('No user with that email');
    });

    it('should return 401 Unauthorized if the password is incorrect', async () => {
        const res = await request(server).post('/api/login').send({ email: adminEmail, password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('Incorrect password');
    });

    it('should return 200 OK and a token if the email and password are correct', async () => {
        const res = await request(server).post('/api/login').send({ email: adminEmail, password: adminPassword });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged in');
    });
});

describe('POST /api/signup', () => {
    let createdUser;

    beforeEach(async () => {
        await db.execute('DELETE FROM user WHERE email = ?', ['test@test.com']);
    });

    afterEach(async () => {
        if (createdUser && createdUser.email) {
            // Delete the user from the database
            await db.execute('DELETE FROM user WHERE email = ?', [createdUser.email]);
            createdUser = null;
        }
    });

    afterAll(async () => {
        // Close the database connection
        await db.end();
    });

    it('should return 201 and "User created" if the user is successfully created', async () => {
        const res = await request(server).post('/api/signup').send({ email: 'test@test.com', password: 'password123' });
        if (res.body && res.body.email) {
            createdUser = res.body;
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual('User created');
    });

    it('should return 400 and "User with that email already exists" if the email is already in use', async () => {
        const res = await request(server).post('/api/signup').send({ email: adminEmail, password: 'password123' }); // replace with an existing email
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual('User with that email already exists');
    });

    /*it('should return 500 and "Server error" if there is a server error', async () => {
        const res = await request(server).post('/api/signup').send({ email: 'error@test.com', password: 'password123' }); // replace with a scenario that causes a server error
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual('Server error');
    });*/
});