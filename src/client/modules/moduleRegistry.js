import cmsModule from "./cmsModule";

const clientModules = [cmsModule];

export const getEnabledClientModules = (store) =>
    clientModules.filter((moduleDefinition) => moduleDefinition.enabled(store));

export const getClientRoutes = () =>
    clientModules.flatMap((moduleDefinition) => moduleDefinition.clientRoutes || []);

export const getAdminNavigationItems = (store) =>
    getEnabledClientModules(store).flatMap((moduleDefinition) => moduleDefinition.navigationItems || []);

export default clientModules;
