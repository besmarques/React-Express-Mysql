const connections = require("../config/dbpool");

const getUsers = async () => {
    const [users] = await connections.execute("SELECT id, email, is_admin AS isAdmin FROM user");
    return users;
};

const findByEmail = async (email) => {
    const [users] = await connections.execute("SELECT id, email, password, is_admin FROM user WHERE email = ?", [email]);
    return users[0];
};

const createUser = async (email, hashedPassword) => {
    await connections.execute("INSERT INTO user (email, password) VALUES (?, ?)", [email, hashedPassword]);
};

const saveResetToken = async (email, resetTokenHash, resetTokenExpiresAt) => {
    const [result] = await connections.execute(
        "UPDATE user SET resetToken = ?, resetTokenExpiresAt = ? WHERE email = ?",
        [resetTokenHash, resetTokenExpiresAt, email]
    );
    return result;
};

const findByResetToken = async (resetTokenHash) => {
    const [users] = await connections.execute(
        "SELECT id, email FROM user WHERE resetToken = ? AND resetTokenExpiresAt > UTC_TIMESTAMP() LIMIT 1",
        [resetTokenHash]
    );
    return users[0];
};

const updatePasswordByResetToken = async (userId, resetTokenHash, hashedPassword) => {
    const [result] = await connections.execute(
        "UPDATE user SET password = ?, resetToken = NULL, resetTokenExpiresAt = NULL WHERE id = ? AND resetToken = ? AND resetTokenExpiresAt > UTC_TIMESTAMP()",
        [hashedPassword, userId, resetTokenHash]
    );
    return result;
};

module.exports = {
    createUser,
    findByEmail,
    findByResetToken,
    getUsers,
    saveResetToken,
    updatePasswordByResetToken,
};
