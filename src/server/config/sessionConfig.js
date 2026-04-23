const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { sessionCookieOptions } = require("./cookieOptions");
require("dotenv").config();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
}

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const sessionStore = new MySQLStore(config);

const sessionMiddleware = session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: sessionCookieOptions,
});

module.exports = sessionMiddleware;
