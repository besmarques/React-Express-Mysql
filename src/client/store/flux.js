import axios from "axios";
const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            env: null,
            basename: null,
            teste: null,
            token: null,
            isAuthenticated: false,
        },
        actions: {
            // Use getActions to call a function within a fuction
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },
            getToken: async () => {
                console.log('Getting token');
                const response = await axios.get('/api/auth-status');
                const isAuthenticated = response.data.isAuthenticated;
                console.log('Authentication status', isAuthenticated);
                setStore({ isAuthenticated });
                return isAuthenticated;
            },
            getEnviromentalVariables: async () => {
                
                const store = getStore();

				//gets enviromental variables from backend
                try {
                    const resp = await axios.get("/api/env", { withCredentials: true });
                    const data = resp.data;
                    setStore({basename: data.REACT_APP_BASENAME});
                    setStore({teste: data.REACT_APP_TESTE});
                } catch (error) {
                    console.log("Error loading message from backend", error);
                }
            },
            loginUser: async (email, password) => {

                getActions().logoutUser();

                try {
                    const response = await axios.post("/api/login", { email, password });
                    console.log("Logged in 2", response);
            
                    // Store the token in local storage
                    //localStorage.setItem('token', `Bearer ${response.data.token}`);
            
                    return response.data;
                } catch (err) {
                    console.error(err);
                    throw err; // Throw the error so it can be caught in the handleSubmit function
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

export default getState;
