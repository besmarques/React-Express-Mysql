const express = require('express');
const cmsRoutes = require('../cms/cmsRoutes');
const { isCmsEnabled } = require('../cms/cmsConfig');
const { getMediaConfig } = require('../cms/media/mediaConfig');

const cmsModule = {
    name: 'cms',
    enabled: (env = process.env) => isCmsEnabled(env),
    registerServer(app, env = process.env) {
        const mediaConfig = getMediaConfig(env);
        app.use(mediaConfig.publicPath, express.static(mediaConfig.directory));
        app.use('/api/cms', cmsRoutes);
    },
};

module.exports = cmsModule;
