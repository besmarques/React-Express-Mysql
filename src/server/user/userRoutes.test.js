jest.mock("../config/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
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

const passwordPolicyMessage = "Password must be at least 8 characters and include uppercase, lowercase, and number characters";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const createApp = require("../app");
const userService = require("./userService");

const createHttpError = (statusCode, responseBody) => {
    const error = new Error("Request failed");
    error.statusCode = statusCode;
    error.responseBody = responseBody;
    return error;
};

const createTestApp = () => createApp({
    sessionMiddleware: (req, res, next) => {
        req.session = {
            destroy: (callback) => callback(),
        };
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
        if (token === "regular-user-token") {
            return { id: 2, isAdmin: false, exp: Math.floor(Date.now() / 1000) + 3600 };
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

    it("should return 403 Forbidden if the user is not an admin", async () => {
        const res = await request(app).get("/api/users").set("Cookie", "token=regular-user-token");

        expect(res.statusCode).toEqual(403);
        expect(userService.getUsers).not.toHaveBeenCalled();
    });
}); 

describe('POST /api/login', () => {
    it('should return 401 Bad Request if no user with that email is found', async () => {
        userService.loginUser.mockRejectedValue(createHttpError(401, 'Invalid email or password'));

        const res = await request(app).post('/api/login').send({ email: 'nonexistent@example.com', password: 'password' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('Invalid email or password');
    });

    it('should return 401 Unauthorized if the password is incorrect', async () => {
        userService.loginUser.mockRejectedValue(createHttpError(401, 'Invalid email or password'));

        const res = await request(app).post('/api/login').send({ email: 'admin@example.com', password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('Invalid email or password');
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

        const res = await request(app).post('/api/signup').send({ email: 'test@test.com', password: 'Password1' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual('User created');
    });

    it('should return 400 and "User with that email already exists" if the email is already in use', async () => {
        userService.signupUser.mockRejectedValue(createHttpError(400, 'User with that email already exists'));

        const res = await request(app).post('/api/signup').send({ email: 'admin@example.com', password: 'Password1' });
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

    it('should return 400 before the service is called if the password is weak', async () => {
        const res = await request(app).post('/api/signup').send({ email: 'test@test.com', password: 'password' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: 'Validation failed',
            errors: [{ field: 'password', message: passwordPolicyMessage }],
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
            newPassword: 'NewPassword1',
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Password has been reset.' });
        expect(userService.resetPassword).toHaveBeenCalledWith('reset-token', 'NewPassword1');
    });

    it('should return 400 before the service is called if the reset token is missing', async () => {
        const res = await request(app).post('/api/reset-password').send({ newPassword: 'new-password' });

        expect(res.statusCode).toEqual(400);
        expect(userService.resetPassword).not.toHaveBeenCalled();
    });

    it('should return 400 before the service is called if the new password is weak', async () => {
        const res = await request(app).post('/api/reset-password').send({
            resetToken: 'reset-token',
            newPassword: 'password',
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: 'Validation failed',
            errors: [{ field: 'newPassword', message: passwordPolicyMessage }],
        });
        expect(userService.resetPassword).not.toHaveBeenCalled();
    });
});

describe('POST /api/logout', () => {
    it('should clear auth cookies even if the token is invalid', async () => {
        const res = await request(app).post('/api/logout').set('Cookie', 'token=invalid-token');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Logged out' });
        expect(res.headers['set-cookie'].join(';')).toContain('token=');
    });
});
