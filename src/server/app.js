const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const autoRenewToken = require('./config/autoRenewToken');
const { registerEnabledModules } = require('./modules/moduleRegistry');
const settingsRoutes = require('./settings/settingsRoutes');
const mainRoutes = require('./main/mainRoutes');
const userRoutes = require('./user/userRoutes');

const createApp = ({ sessionMiddleware, staticRoot = __dirname } = {}) => {
  const app = express();
  const resolvedSessionMiddleware = sessionMiddleware || require('./config/sessionConfig');

  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: process.env.JSON_BODY_LIMIT || '10mb' }));
  app.use(resolvedSessionMiddleware);
  app.use(cookieParser());
  app.use(autoRenewToken);

  app.use('/api', settingsRoutes);
  app.use('/api', mainRoutes);
  app.use('/api', userRoutes);
  registerEnabledModules(app);

  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });

  app.use(express.static(path.join(staticRoot, 'public')));

  app.get('/client.js', (req, res) => {
    res.sendFile(path.resolve(staticRoot, 'client.js'));
  });

  app.use('/chunks', express.static(path.join(staticRoot, 'chunks')));

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.resolve(staticRoot, 'public', 'index.html'));
  });

  return app;
};

module.exports = createApp;
