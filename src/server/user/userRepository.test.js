jest.mock("../config/dbpool", () => ({
    execute: jest.fn(),
}));

const connections = require("../config/dbpool");
const userRepository = require("./userRepository");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("userRepository", () => {
    it("returns only safe user fields for user listings", async () => {
        const users = [{ id: 1, email: "admin@example.com", isAdmin: 1 }];
        connections.execute.mockResolvedValue([users]);

        const result = await userRepository.getUsers();

        expect(connections.execute).toHaveBeenCalledWith("SELECT id, email, is_admin AS isAdmin FROM user");
        expect(result).toEqual(users);
    });

    it("stores a hashed reset token with an expiry", async () => {
        const expiresAt = new Date("2026-04-22T22:00:00.000Z");
        connections.execute.mockResolvedValue([{ affectedRows: 1 }]);

        const result = await userRepository.saveResetToken("user@example.com", "hashed-token", expiresAt);

        expect(connections.execute).toHaveBeenCalledWith(
            "UPDATE user SET resetToken = ?, resetTokenExpiresAt = ? WHERE email = ?",
            ["hashed-token", expiresAt, "user@example.com"]
        );
        expect(result).toEqual({ affectedRows: 1 });
    });

    it("only finds unexpired reset tokens", async () => {
        connections.execute.mockResolvedValue([[{ id: 1, email: "user@example.com" }]]);

        const result = await userRepository.findByResetToken("hashed-token");

        expect(connections.execute).toHaveBeenCalledWith(
            "SELECT id, email FROM user WHERE resetToken = ? AND resetTokenExpiresAt > UTC_TIMESTAMP() LIMIT 1",
            ["hashed-token"]
        );
        expect(result).toEqual({ id: 1, email: "user@example.com" });
    });
});
