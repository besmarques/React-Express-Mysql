import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from "../store/appContext";

const LoginWrapper = ({ children }) => {
    const { store } = useContext(Context);

    if (store.isAuthLoading) {
        return <div>Loading...</div>;
    }

    return store.isAuthenticated ? <Navigate to="/" /> : children;
};

export default LoginWrapper;
