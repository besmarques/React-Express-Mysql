import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Context } from "../store/appContext";

function Teste() {

    const { store, actions } = useContext(Context); 

    const [data, setData] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response1 = await axios.get('/api');
                setData(response1.data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
    
        fetchData();
    }, []);

    return (
        <>
            <h1>Hello React</h1>
            <h1>{data ? `Response from API: ${data}` : 'Loading...'}</h1>
            <h1>{store.env ? `Response from backend: ${store.env.teste}` : 'Loading...'}</h1>
        </>
        );
}

export default Teste;