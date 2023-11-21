import axios from "axios";
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
        },
    };
};

export default getState;
