import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";

const Status = () => {

    const { store, actions } = useContext(Context); 

    return (
        <>
            <h1>Hello React</h1>
            <h1>{store.statusMessage ? `Response from backend: ${store.statusMessage}` : ("Loading status...")}</h1>
            <h2>{store.basename ? `Response from basename: ${store.basename}` : ("Loading basename...")}</h2>
        </>
        );
}

export default Status;
