import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const PrivateWrapper = ({ children, isAdminPage = false }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth-status');
                setIsLoggedIn(response.data.isAuthenticated);
                if (response.data.isAdmin) {
                    setIsAdmin(true);
                }
                console.log("teste", response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Or your custom loading component
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (isAdminPage && !isAdmin) {
        return <Navigate to="/" />; // Redirect to home page if user is not admin
    }

    return children;
};

export default PrivateWrapper;