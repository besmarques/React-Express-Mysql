import React, { useContext } from 'react';
import { Context } from "../store/appContext";

const Status = () => {

    const { store } = useContext(Context); 

    return (
        <>
            <h1>Hello React</h1>
            <h1>{store.statusMessage ? `Response from backend: ${store.statusMessage}` : ("Loading status...")}</h1>
            <h2>{store.appName ? `App name: ${store.appName}` : ("Loading app name...")}</h2>
            <h2>{store.routerBasename ? `Router basename: ${store.routerBasename}` : ("Router basename not configured.")}</h2>
        </>
        );
}

export default Status;
