const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
require("dotenv").config();

const config = {
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

var sessionStore = new MySQLStore(config);

const sessionMiddleware = session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 4 * 3600000, // 4 hours
    },
});

module.exports = sessionMiddleware;
