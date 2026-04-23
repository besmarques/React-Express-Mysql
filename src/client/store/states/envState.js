import axios from "axios";

const getEnvState = ({ setStore }) => {
    return {
        store: {
            cmsEnabled: false,
            cmsTheme: "default",
            env: null,
            basename: null,
            isEnvLoading: true,
            statusMessage: null,
        },
        actions: {
            getEnvironmentalVariables: async () => {
                try {
                    const resp = await axios.get("/api/env", { withCredentials: true });
                    const data = resp.data;
                    setStore({ basename: data.REACT_APP_BASENAME });
                    setStore({ cmsEnabled: Boolean(data.CMS_ENABLED) });
                    setStore({ cmsTheme: data.CMS_THEME || "default" });
                    setStore({ isEnvLoading: false });
                    setStore({ statusMessage: data.REACT_APP_STATUS_MESSAGE });
                } catch (error) {
                    setStore({ basename: null, cmsEnabled: false, cmsTheme: "default", isEnvLoading: false, statusMessage: null });
                }
            },
        },
    };
};

export default getEnvState;
