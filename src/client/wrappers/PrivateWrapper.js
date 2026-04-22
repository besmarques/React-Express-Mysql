import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from "../store/appContext";

const PrivateWrapper = ({ children, isAdminPage = false }) => {
    const { store } = useContext(Context);

    if (store.isAuthLoading) {
        return <div>Loading...</div>;
    }

    if (!store.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (isAdminPage && !store.isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateWrapper;
