import axios from "axios";

const getAuthState = ({ getStore, getActions, setStore }) => {
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
                    console.error(err);
                    setStore({ isAuthenticated: false, isAdmin: false, isAuthLoading: false });
                    return { isAuthenticated: false, isAdmin: false };
                }
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
                    await getActions().getToken();
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
                } finally {
                    setStore({ isAuthenticated: false, isAdmin: false, isAuthLoading: false });
                }
            },
        },
    };
};

export default getAuthState;
