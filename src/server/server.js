require('dotenv').config();

const createApp = require('./app');
const logger = require('./config/logger');
const connections = require('./config/dbpool');
const { optionalEnvVariables, validateServerEnv } = require('./config/validateEnv');

const PORT = process.env.APP_PORT || 8080;
const warnMissingOptionalEnv = () => {
  optionalEnvVariables
    .filter((name) => !process.env[name] || process.env[name].trim() === '')
    .forEach((name) => logger.warn(`${name} is not configured; related features may be unavailable`));
};

const startServer = async () => {
  try {
    validateServerEnv();
    await connections.checkDatabaseConnection();
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }

  warnMissingOptionalEnv();

  const app = createApp();

  app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();
