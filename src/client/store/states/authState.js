import axios from "axios";

const getAuthState = ({ getActions, setStore }) => {
    return {
        store: {
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isAuthLoading: true,
        },
        actions: {
            getToken: async () => {
                try {
                    const response = await axios.get('/api/auth-status');
                    const isAuthenticated = response.data.isAuthenticated;
                    const isAdmin = Boolean(response.data.isAdmin);
                    setStore({ isAuthenticated, isAdmin, isAuthLoading: false });
                    return { isAuthenticated, isAdmin };
                } catch (err) {
                    setStore({ isAuthenticated: false, isAdmin: false, isAuthLoading: false });
                    return { isAuthenticated: false, isAdmin: false };
                }
            },
            signupUser: async (email, password) => {
                try {
                    const response = await axios.post("/api/signup", { email, password });
                    return response.data;
                } catch (err) {
                    throw err;
                }
            },
            loginUser: async (email, password) => {
                setStore({ isAuthenticated: false, isAdmin: false });
                try {
                    const response = await axios.post("/api/login", { email, password });
                    await getActions().getToken();
                    return response.data;
                } catch (err) {
                    throw err;
                }
            },
            logoutUser: async () => {
                try {
                    await axios.post("/api/logout");
                } catch (err) {
                    return;
                } finally {
                    setStore({ isAuthenticated: false, isAdmin: false, isAuthLoading: false });
                }
            },
        },
    };
};

export default getAuthState;
