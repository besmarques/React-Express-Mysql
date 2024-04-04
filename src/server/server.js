require('dotenv').config();

//require('newrelic');

//imports
const express = require('express');
const path = require('path');
const app = express();

//import logger function
const logger = require('./config/logger');

//import db connection
const connections = require('./config/dbpool');

//import session middleware
const sessionMiddleware = require('./config/sessionConfig');
app.use(sessionMiddleware);


const mainRoutes = require('./main/mainRoutes');
app.use('/api', mainRoutes);



app.get('/testdb', async (req, res) => {

  let sqlQuery = "SELECT * FROM company";

  try {
    const teste = await connections.query(sqlQuery);
    logger.info( sqlQuery + " completed succefully");
    console.log(teste);
    res.json("teste");
  } catch (err) {
    console.error(err);
    //res.status(500).send('Failed to execute query');
    res.status(500).send(err.errno + " - " + err.code + " - " + err.sqlMessage);
    logger.error(err.errno + " - " + err.code + " - " + err.sqlMessage);
  }
});




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

