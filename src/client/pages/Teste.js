import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Context } from "../store/appContext";

function Teste() {

    const { store, actions } = useContext(Context); 
    const [teste, setTeste] = useState(null);

    console.log("asdasd",store.teste);

  

    return (
        <>
            <h1>Hello React</h1>
            <h1>{store.teste ? `Response from backend: ${store.teste}` : 'Loading teste...'}</h1>
            <h2>{store.basename ? `Response from basename: ${store.basename}` : 'Loading basename...'}</h2>
        </>
        );
}

export default Teste;