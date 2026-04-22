const connections = require("../config/dbpool");

const getUsers = async () => {
    const [users] = await connections.execute("SELECT * FROM user");
    return users;
};

const findByEmail = async (email) => {
    const [users] = await connections.execute("SELECT * FROM user WHERE email = ?", [email]);
    return users[0];
};

const createUser = async (email, hashedPassword) => {
    await connections.execute("INSERT INTO user (email, password) VALUES (?, ?)", [email, hashedPassword]);
};

const saveResetToken = async (email, resetToken) => {
    await connections.execute("UPDATE user SET resetToken = ? WHERE email = ?", [resetToken, email]);
};

const findByResetToken = async (resetToken) => {
    const [users] = await connections.execute("SELECT * FROM user WHERE resetToken = ?", [resetToken]);
    return users[0];
};

const updatePasswordByResetToken = async (resetToken, hashedPassword) => {
    await connections.execute("UPDATE user SET password = ?, resetToken = NULL WHERE resetToken = ?", [hashedPassword, resetToken]);
};

module.exports = {
    createUser,
    findByEmail,
    findByResetToken,
    getUsers,
    saveResetToken,
    updatePasswordByResetToken,
};
