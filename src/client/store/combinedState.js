import getAuthState from "./states/authState";
import getEnvState from "./states/envState";

const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            ...getAuthState({ getStore, getActions, setStore }).store,
            ...getEnvState({ getStore, getActions, setStore }).store,
        },
        actions: {
            ...getAuthState({ getStore, getActions, setStore }).actions,
            ...getEnvState({ getStore, getActions, setStore }).actions,
        },
    };
};

export default getState;
