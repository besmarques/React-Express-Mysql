import coreModule from "./coreModule";
import cmsModule from "./cmsModule";

const clientModules = [coreModule, cmsModule];

const defaultRouteOrder = 500;

export const getEnabledClientModules = (store) =>
    clientModules.filter((moduleDefinition) => moduleDefinition.enabled(store));

export const getClientRoutes = (store) =>
    clientModules
        .filter((moduleDefinition) => store?.isEnvLoading || moduleDefinition.enabled(store))
        .flatMap((moduleDefinition) => moduleDefinition.clientRoutes || [])
        .map((route, index) => ({
            ...route,
            __routeIndex: index,
            __routeOrder: route.order ?? defaultRouteOrder,
        }))
        .sort((leftRoute, rightRoute) => {
            if (leftRoute.__routeOrder !== rightRoute.__routeOrder) {
                return leftRoute.__routeOrder - rightRoute.__routeOrder;
            }

            return leftRoute.__routeIndex - rightRoute.__routeIndex;
        })
        .map(({ __routeIndex, __routeOrder, ...route }) => route);

export const getAdminNavigationItems = (store) =>
    getEnabledClientModules(store).flatMap((moduleDefinition) => moduleDefinition.navigationItems || []);

export const getSidebarNavigationItems = (store) =>
    getEnabledClientModules(store).flatMap((moduleDefinition) => moduleDefinition.sidebarItems || []);

export default clientModules;
