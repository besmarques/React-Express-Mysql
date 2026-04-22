import axios from "axios";

const getEnvState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            env: null,
            basename: null,
            statusMessage: null,
        },
        actions: {
            getEnvironmentalVariables: async () => {
                const store = getStore();
                try {
                    const resp = await axios.get("/api/env", { withCredentials: true });
                    const data = resp.data;
                    setStore({ basename: data.REACT_APP_BASENAME });
                    setStore({ statusMessage: data.REACT_APP_STATUS_MESSAGE });
                } catch (error) {
                    console.log("Error loading message from backend", error);
                }
            },
        },
    };
};

export default getEnvState;
