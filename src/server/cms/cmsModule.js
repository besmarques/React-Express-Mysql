const cmsModule = require('../modules/cmsModule');

const registerCmsModule = (app, env = process.env) => {
    if (!cmsModule.enabled(env)) {
        return false;
    }

    cmsModule.registerServer(app, env);
    return true;
};

module.exports = {
    cmsModule,
    registerCmsModule,
};
