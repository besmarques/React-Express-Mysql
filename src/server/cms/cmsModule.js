const express = require('express');
const cmsRoutes = require('./cmsRoutes');
const { isCmsEnabled } = require('./cmsConfig');
const { getMediaConfig } = require('./media/mediaConfig');

const registerCmsModule = (app, env = process.env) => {
    if (!isCmsEnabled(env)) {
        return false;
    }

    const mediaConfig = getMediaConfig(env);
    app.use(mediaConfig.publicPath, express.static(mediaConfig.directory));
    app.use('/api/cms', cmsRoutes);
    return true;
};

module.exports = {
    registerCmsModule,
};
