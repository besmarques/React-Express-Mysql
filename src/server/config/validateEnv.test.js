const { getMissingServerEnv, optionalEnvVariables, validateServerEnv } = require("./validateEnv");

const validEnv = {
    APP_PUBLIC_URL: "https://app.example.com",
    DB_HOST: "localhost",
    DB_PORT: "3306",
    DB_USER: "app",
    DB_NAME: "app_db",
    JWT_SECRET: "jwt-secret",
    SESSION_SECRET: "session-secret",
};

describe("validateEnv", () => {
    it("accepts required startup configuration without SMTP values", () => {
        expect(getMissingServerEnv(validEnv)).toEqual([]);
        expect(optionalEnvVariables).toEqual(["DB_PASSWORD", "EMAIL_USERNAME", "EMAIL_PASSWORD", "SMTP_HOST", "SMTP_PORT"]);
        expect(() => validateServerEnv(validEnv)).not.toThrow();
    });

    it("fails startup when required values are missing", () => {
        expect(() => validateServerEnv({}))
            .toThrow("Missing required environment variables: APP_PUBLIC_URL, JWT_SECRET, SESSION_SECRET, DB_HOST, DB_PORT, DB_USER, DB_NAME");
    });
});
