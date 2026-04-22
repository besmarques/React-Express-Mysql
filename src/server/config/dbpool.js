const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || process.env.HOST,
    port: process.env.DB_PORT || process.env.PORT,
    user: process.env.DB_USER || process.env.USER,
    password: process.env.DB_PASSWORD || process.env.PASSWORD,
    database: process.env.DB_NAME || process.env.DATABASE
});

const checkDatabaseConnection = async () => {
    let connection;

    try {
        connection = await pool.getConnection();
    } catch (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        } else {
            console.error('Database connection error:', err.message);
        }
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

checkDatabaseConnection();

module.exports = pool;
