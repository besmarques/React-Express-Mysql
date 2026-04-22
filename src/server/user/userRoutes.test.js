jest.mock("../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "valid-token"),
    verify: jest.fn(),
}));

jest.mock("./userService", () => ({
    getUsers: jest.fn(),
    loginUser: jest.fn(),
    resetPassword: jest.fn(),
    sendPasswordReset: jest.fn(),
    signupUser: jest.fn(),
}));

const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const userRoutes = require("./userRoutes");
const userService = require("./userService");

const createHttpError = (statusCode, responseBody) => {
    const error = new Error("Request failed");
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use((req, res, next) => {
        req.session = {
            destroy: (callback) => callback(),
        };
        next();
    });
    app.use("/api", userRoutes);

    return app;
};

const app = createApp();

beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify.mockImplementation((token) => {
        if (token === "valid-token") {
            return { id: 1, isAdmin: true };
        }

        throw new Error("invalid token");
    });
});

describe("GET /api/users", () => {
    it("should return 401 Unauthorized if no authentication is provided", async () => {
        const res = await request(app).get("/api/users");
        expect(res.statusCode).toEqual(401);
        expect(userService.getUsers).not.toHaveBeenCalled();
    });

    it("should return 200 OK if a valid token is provided", async () => {
        userService.getUsers.mockResolvedValue([{ id: 1, email: "admin@example.com" }]);

        const token = jwt.sign({ isAdmin: true });
        const res = await request(app).get("/api/users").set("Cookie", `token=${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([{ id: 1, email: "admin@example.com" }]);
    });
}); 

describe('POST /api/login', () => {
    it('should return 401 Bad Request if no user with that email is found', async () => {
        userService.loginUser.mockRejectedValue(createHttpError(401, 'No user with that email'));

        const res = await request(app).post('/api/login').send({ email: 'nonexistent@example.com', password: 'password' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('No user with that email');
    });

    it('should return 401 Unauthorized if the password is incorrect', async () => {
        userService.loginUser.mockRejectedValue(createHttpError(401, 'Incorrect password'));

        const res = await request(app).post('/api/login').send({ email: 'admin@example.com', password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('Incorrect password');
    });

    it('should return 200 OK and a token if the email and password are correct', async () => {
        userService.loginUser.mockResolvedValue({ token: 'valid-token', userId: 1 });

        const res = await request(app).post('/api/login').send({ email: 'admin@example.com', password: 'correctpassword' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged in');
        expect(res.headers['set-cookie'][0]).toContain('token=valid-token');
    });

    it('should return 400 before the service is called if the email is invalid', async () => {
        const res = await request(app).post('/api/login').send({ email: 'invalid', password: 'password' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: 'Validation failed',
            errors: [{ field: 'email', message: 'Email must be valid' }],
        });
        expect(userService.loginUser).not.toHaveBeenCalled();
    });
});

describe('POST /api/signup', () => {
    it('should return 201 and "User created" if the user is successfully created', async () => {
        userService.signupUser.mockResolvedValue();

        const res = await request(app).post('/api/signup').send({ email: 'test@test.com', password: 'password123' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual('User created');
    });

    it('should return 400 and "User with that email already exists" if the email is already in use', async () => {
        userService.signupUser.mockRejectedValue(createHttpError(400, 'User with that email already exists'));

        const res = await request(app).post('/api/signup').send({ email: 'admin@example.com', password: 'password123' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual('User with that email already exists');
    });

    it('should return 400 before the service is called if the password is missing', async () => {
        const res = await request(app).post('/api/signup').send({ email: 'test@test.com' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: 'Validation failed',
            errors: [{ field: 'password', message: 'Password is required' }],
        });
        expect(userService.signupUser).not.toHaveBeenCalled();
    });
});

describe('POST /api/forgot-password', () => {
    it('should send a reset email for a valid email request', async () => {
        userService.sendPasswordReset.mockResolvedValue();

        const res = await request(app).post('/api/forgot-password').send({ email: 'test@test.com' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Password reset link sent to email.' });
        expect(userService.sendPasswordReset).toHaveBeenCalledWith('test@test.com');
    });

    it('should return 400 before the service is called if the email is invalid', async () => {
        const res = await request(app).post('/api/forgot-password').send({ email: 'invalid' });

        expect(res.statusCode).toEqual(400);
        expect(userService.sendPasswordReset).not.toHaveBeenCalled();
    });
});

describe('POST /api/reset-password', () => {
    it('should reset the password for a valid reset request', async () => {
        userService.resetPassword.mockResolvedValue();

        const res = await request(app).post('/api/reset-password').send({
            resetToken: 'reset-token',
            newPassword: 'new-password',
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Password has been reset.' });
        expect(userService.resetPassword).toHaveBeenCalledWith('reset-token', 'new-password');
    });

    it('should return 400 before the service is called if the reset token is missing', async () => {
        const res = await request(app).post('/api/reset-password').send({ newPassword: 'new-password' });

        expect(res.statusCode).toEqual(400);
        expect(userService.resetPassword).not.toHaveBeenCalled();
    });
});
