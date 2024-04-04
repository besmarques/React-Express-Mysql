import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateWrapper = ({ children }) => {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    return isLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateWrapper;