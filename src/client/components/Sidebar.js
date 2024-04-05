import React, { useState, useContext } from 'react';
import { Context } from "../store/appContext";
import { Link, useNavigate } from 'react-router-dom';


function Sidebar() {

    const { store, actions } = useContext(Context); 

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await actions.logoutUser();
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="d-flex flex-column">
            this is the sidebar
            <Link to="/">
                <button type="button">
                    Go to Home
                </button>
            </Link>
            <Link to="/teste">
                <button type="button">
                    Go to teste
                </button>
            </Link>
            <button type="button" onClick={() => handleLogout()}>Logout</button>
        </div>
    );
}

export default Sidebar;