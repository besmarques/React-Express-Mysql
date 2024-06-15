import axios from "axios";

const getAuthState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: null,
            isAuthenticated: false,
        },
        actions: {
            getToken: async () => {
                console.log('Getting token');
                const response = await axios.get('/api/auth-status');
                const isAuthenticated = response.data.isAuthenticated;
                console.log('Authentication status', isAuthenticated);
                setStore({ isAuthenticated });
                return isAuthenticated;
            },
            signupUser: async (email, password) => {
                try {
                    const response = await axios.post("/api/signup", { email, password });
                    console.log("Signed up", response);
                    return response.data;
                } catch (err) {
                    console.error(err);
                    throw err;
                }
            },
            loginUser: async (email, password) => {
                getActions().logoutUser();
                try {
                    const response = await axios.post("/api/login", { email, password });
                    console.log("Logged in", response);
                    return response.data;
                } catch (err) {
                    console.error(err);
                    throw err;
                }
            },
            logoutUser: async () => {
                try {
                    await axios.post("/api/logout");
                } catch (err) {
                    console.error(err);
                }
            },
        },
    };
};

export default getAuthState;
