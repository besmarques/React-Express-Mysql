const connections = require("../config/dbpool");

const getUsers = async () => {
    const [users] = await connections.execute("SELECT id, email, is_admin AS isAdmin FROM user");
    return users;
};

const findByEmail = async (email) => {
    const [users] = await connections.execute("SELECT id, email, password, is_admin FROM user WHERE email = ?", [email]);
    return users[0];
};

const getUserPermissions = async (userId) => {
    try {
        const [permissions] = await connections.execute(
            `SELECT DISTINCT cms_permissions.name
             FROM cms_permissions
             INNER JOIN cms_role_permissions
                ON cms_role_permissions.permission_id = cms_permissions.id
             INNER JOIN cms_user_roles
                ON cms_user_roles.role_id = cms_role_permissions.role_id
             WHERE cms_user_roles.user_id = ?
             ORDER BY cms_permissions.name ASC`,
            [userId]
        );

        return permissions.map((permission) => permission.name);
    } catch (err) {
        if (err && (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_BAD_TABLE_ERROR")) {
            return [];
        }

        throw err;
    }
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
    getUserPermissions,
    getUsers,
    saveResetToken,
    updatePasswordByResetToken,
};
