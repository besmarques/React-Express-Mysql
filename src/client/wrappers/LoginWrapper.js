import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const LoginWrapper = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth-status');
                setIsLoggedIn(response.data.isAuthenticated);
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

    return isLoggedIn ? <Navigate to="/" /> : children;
};

export default LoginWrapper;