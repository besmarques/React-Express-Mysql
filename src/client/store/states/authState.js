import axios from "axios";

const getAuthState = ({ getActions, setStore }) => {
    return {
        store: {
            canAccessCms: false,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isAuthLoading: true,
            permissions: [],
        },
        actions: {
            getToken: async () => {
                try {
                    const response = await axios.get('/api/auth-status');
                    const isAuthenticated = response.data.isAuthenticated;
                    const isAdmin = Boolean(response.data.isAdmin);
                    const permissions = Array.isArray(response.data.permissions) ? response.data.permissions : [];
                    const canAccessCms = Boolean(response.data.canAccessCms);
                    setStore({ canAccessCms, isAuthenticated, isAdmin, isAuthLoading: false, permissions });
                    return { canAccessCms, isAuthenticated, isAdmin, permissions };
                } catch (err) {
                    setStore({ canAccessCms: false, isAuthenticated: false, isAdmin: false, isAuthLoading: false, permissions: [] });
                    return { canAccessCms: false, isAuthenticated: false, isAdmin: false, permissions: [] };
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
                setStore({ canAccessCms: false, isAuthenticated: false, isAdmin: false, permissions: [] });
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
                    setStore({ canAccessCms: false, isAuthenticated: false, isAdmin: false, isAuthLoading: false, permissions: [] });
                }
            },
        },
    };
};

export default getAuthState;
