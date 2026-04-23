const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const getDatabaseErrorMessage = (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        return 'Database connection was closed.';
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        return 'Database has too many connections.';
    }
    if (err.code === 'ECONNREFUSED') {
        return 'Database connection was refused.';
    }

    return `Database connection error: ${err.message}`;
};

const checkDatabaseConnection = async () => {
    let connection;

    try {
        connection = await pool.getConnection();
        return true;
    } catch (err) {
        const error = new Error(getDatabaseErrorMessage(err));
        error.cause = err;
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = pool;
module.exports.checkDatabaseConnection = checkDatabaseConnection;
