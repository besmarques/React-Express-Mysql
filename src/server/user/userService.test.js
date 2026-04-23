process.env.EMAIL_USERNAME = "noreply@example.com";
process.env.JWT_SECRET = "test-secret";
process.env.APP_PUBLIC_URL = "https://app.example.com";

jest.mock("bcrypt", () => ({
    compare: jest.fn(),
    hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

jest.mock("../config/email", () => ({
    sendMail: jest.fn(),
}));

jest.mock("./userRepository", () => ({
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    findByResetToken: jest.fn(),
    getUsers: jest.fn(),
    saveResetToken: jest.fn(),
    updatePasswordByResetToken: jest.fn(),
}));

const crypto = require("crypto");
const transporter = require("../config/email");
const userRepository = require("./userRepository");
const userService = require("./userService");

const hashResetToken = (resetToken) => crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("userService password reset", () => {
    it("stores a hashed reset token and emails the raw token", async () => {
        userRepository.saveResetToken.mockResolvedValue({ affectedRows: 1 });

        await userService.sendPasswordReset("user@example.com");

        const saveCall = userRepository.saveResetToken.mock.calls[0];
        const mailOptions = transporter.sendMail.mock.calls[0][0];
        const rawToken = mailOptions.text.match(/reset-password\/([a-f0-9]+)/)[1];

        expect(saveCall[0]).toEqual("user@example.com");
        expect(saveCall[1]).toEqual(hashResetToken(rawToken));
        expect(saveCall[1]).not.toEqual(rawToken);
        expect(saveCall[2]).toBeInstanceOf(Date);
        expect(saveCall[2].getTime()).toBeGreaterThan(Date.now());
        expect(mailOptions.to).toEqual("user@example.com");
        expect(mailOptions.text).toContain(`https://app.example.com/reset-password/${rawToken}`);
    });

    it("does not send reset email when no user row is updated", async () => {
        userRepository.saveResetToken.mockResolvedValue({ affectedRows: 0 });

        await userService.sendPasswordReset("missing@example.com");

        expect(transporter.sendMail).not.toHaveBeenCalled();
    });

    it("hashes the submitted reset token before lookup and update", async () => {
        const tokenHash = hashResetToken("raw-reset-token");
        userRepository.findByResetToken.mockResolvedValue({ id: 7, email: "user@example.com" });
        userRepository.updatePasswordByResetToken.mockResolvedValue({ affectedRows: 1 });

        await userService.resetPassword("raw-reset-token", "new-password");

        expect(userRepository.findByResetToken).toHaveBeenCalledWith(tokenHash);
        expect(userRepository.updatePasswordByResetToken).toHaveBeenCalledWith(7, tokenHash, "hashed-password");
    });

    it("rejects invalid or expired reset tokens", async () => {
        userRepository.findByResetToken.mockResolvedValue(undefined);

        await expect(userService.resetPassword("bad-token", "new-password"))
            .rejects
            .toMatchObject({
                statusCode: 400,
                responseBody: { message: "Invalid or expired reset token." },
            });
    });
});

describe("userService login", () => {
    it("returns the same error for missing users and wrong passwords", async () => {
        userRepository.findByEmail.mockResolvedValueOnce(undefined);

        await expect(userService.loginUser("missing@example.com", "password"))
            .rejects
            .toMatchObject({ statusCode: 401, responseBody: "Invalid email or password" });

        userRepository.findByEmail.mockResolvedValueOnce({ id: 1, email: "user@example.com", password: "hash", is_admin: 0 });
        require("bcrypt").compare.mockResolvedValueOnce(false);

        await expect(userService.loginUser("user@example.com", "wrong-password"))
            .rejects
            .toMatchObject({ statusCode: 401, responseBody: "Invalid email or password" });
    });
});
