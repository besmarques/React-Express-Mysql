import axios from "axios";

const getNormalizedString = (value) => {
    if (typeof value !== "string") {
        return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
};

const getEnvState = ({ setStore }) => {
    return {
        store: {
            appName: "React Express MySQL",
            cmsEnabled: false,
            cmsTheme: "default",
            env: null,
            routerBasename: null,
            isEnvLoading: true,
            statusMessage: null,
        },
        actions: {
            getEnvironmentalVariables: async () => {
                try {
                    const resp = await axios.get("/api/env", { withCredentials: true });
                    const data = resp.data;
                    setStore({
                        appName: getNormalizedString(data.REACT_APP_NAME) || "React Express MySQL",
                        cmsEnabled: Boolean(data.CMS_ENABLED),
                        cmsTheme: data.CMS_THEME || "default",
                        isEnvLoading: false,
                        routerBasename: getNormalizedString(data.REACT_APP_BASENAME),
                        statusMessage: data.REACT_APP_STATUS_MESSAGE,
                    });
                } catch (error) {
                    setStore({
                        appName: "React Express MySQL",
                        cmsEnabled: false,
                        cmsTheme: "default",
                        isEnvLoading: false,
                        routerBasename: null,
                        statusMessage: null,
                    });
                }
            },
        },
    };
};

export default getEnvState;
