jest.mock("nodemailer", () => ({
    createTransport: jest.fn(),
}));

const nodemailer = require("nodemailer");
const email = require("./email");

const originalEnv = process.env;

describe("email config", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("rejects with a controlled service error when SMTP is not configured", async () => {
        delete process.env.EMAIL_USERNAME;
        delete process.env.EMAIL_PASSWORD;
        delete process.env.SMTP_HOST;
        delete process.env.SMTP_PORT;

        await expect(email.sendMail({ to: "user@example.com" }))
            .rejects.toMatchObject({
                statusCode: 503,
                responseBody: {
                    code: "EMAIL_NOT_CONFIGURED",
                    message: "Email sending is not configured for this app yet.",
                },
            });
        expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it("creates the transporter only when sending with full SMTP configuration", async () => {
        const sendMail = jest.fn().mockResolvedValue({ accepted: ["user@example.com"] });
        nodemailer.createTransport.mockReturnValue({ sendMail });
        process.env.EMAIL_USERNAME = "sender@example.com";
        process.env.EMAIL_PASSWORD = "password";
        process.env.SMTP_HOST = "smtp.example.com";
        process.env.SMTP_PORT = "587";
        process.env.SMTP_SECURE = "false";

        await expect(email.sendMail({ to: "user@example.com" })).resolves.toEqual({
            accepted: ["user@example.com"],
        });

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            host: "smtp.example.com",
            port: 587,
            secure: false,
            auth: {
                user: "sender@example.com",
                pass: "password",
            },
        });
        expect(sendMail).toHaveBeenCalledWith({ to: "user@example.com" });
    });
});
