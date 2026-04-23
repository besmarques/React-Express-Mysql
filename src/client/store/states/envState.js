import axios from "axios";

const getEnvState = ({ setStore }) => {
    return {
        store: {
            env: null,
            basename: null,
            statusMessage: null,
        },
        actions: {
            getEnvironmentalVariables: async () => {
                try {
                    const resp = await axios.get("/api/env", { withCredentials: true });
                    const data = resp.data;
                    setStore({ basename: data.REACT_APP_BASENAME });
                    setStore({ statusMessage: data.REACT_APP_STATUS_MESSAGE });
                } catch (error) {
                    setStore({ basename: null, statusMessage: null });
                }
            },
        },
    };
};

export default getEnvState;
