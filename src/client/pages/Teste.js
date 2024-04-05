import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";

const Teste = () => {

    const { store, actions } = useContext(Context); 

    return (
        <>
            <h1>Hello React</h1>
            <h1>{store.teste ? `Response from backend: ${store.teste}` : ("Loading teste...")}</h1>
            <h2>{store.basename ? `Response from basename: ${store.basename}` : ("Loading basename...")}</h2>
        </>
        );
}

export default Teste;