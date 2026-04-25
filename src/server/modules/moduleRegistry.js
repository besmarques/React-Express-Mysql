const cmsModule = require('./cmsModule');

const serverModules = [cmsModule];

const getEnabledServerModules = (env = process.env) =>
    serverModules.filter((moduleDefinition) => moduleDefinition.enabled(env));

const registerEnabledModules = (app, env = process.env) => {
    const enabledModules = getEnabledServerModules(env);

    enabledModules.forEach((moduleDefinition) => {
        moduleDefinition.registerServer(app, env);
    });

    return enabledModules.map((moduleDefinition) => moduleDefinition.name);
};

module.exports = {
    serverModules,
    getEnabledServerModules,
    registerEnabledModules,
};
