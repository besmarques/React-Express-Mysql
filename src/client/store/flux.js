import axios from "axios";
import { useHistory } from 'react-router-dom';
const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            env: null,
        },
        actions: {
            // Use getActions to call a function within a fuction
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },
            getEnviromentalVariables: async () => {
				//gets enviromental variables from backend
                try {
                    const resp = await axios.get(
                        "/api/env"
                    );
                    const data = resp.data;
                    setStore({ env: data.env });					
                    return data;
                } catch (error) {
                    console.log("Error loading message from backend", error);
                }
            },
            loginUser: async (email, password) => {
                try {
                    const response = await axios.post("/api/login", { email, password });
                    console.log("Logged in 2", response);
            
                    // Store the token in local storage
                    localStorage.setItem('token', response.data.token);
                } catch (err) {
                    console.error(err);
                }
            },
        },
    };
};

export default getState;
