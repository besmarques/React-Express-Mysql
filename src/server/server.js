require('dotenv').config();

//require('newrelic');

//imports
const express = require('express');
const path = require('path');
const app = express();

// Use built-in middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import logger function
const logger = require('./config/logger');

//import db connection
const connections = require('./config/dbpool');

//import session middleware
const sessionMiddleware = require('./config/sessionConfig');
app.use(sessionMiddleware);

//import cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//import token auto renew middleware
const autoRenewToken = require('./config/autoRenewToken');
app.use(autoRenewToken);


const settingsRoutes = require('./settings/settingsRoutes');
app.use('/api', settingsRoutes);

const mainRoutes = require('./main/mainRoutes');
app.use('/api', mainRoutes);

const userRoutes = require('./user/userRoutes');
app.use('/api', userRoutes);


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve client.js
app.get('/client.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client.js'));
});

/*
#############################################################################################
#                                                                                           #
#                    WARNING: This should be the last route in the file.                    #
#             It handles all routes that haven't been matched by the above routes.          #
#                                                                                           #
#############################################################################################
*/
// All other GET requests not handled before will render our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});


// Start the server
const PORT = process.env.APP_PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});