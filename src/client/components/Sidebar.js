import React, { useContext } from 'react';
import { Context } from "../store/appContext";
import { Link, useNavigate } from 'react-router-dom';

import CustomButton from '../components/Button';


function Sidebar() {

    const { actions } = useContext(Context); 

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await actions.logoutUser();
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    return (
        <div className="d-flex flex-column">
            this is the sidebar
            <Link to="/" className="block">
                <CustomButton variant="contained" color="primary" name="Go to Home" />
            </Link>
            <Link to="/status" className="block">
                <CustomButton variant="contained" color="primary" name="Go to Status" />
            </Link>
            <CustomButton variant="contained" color="red" name="Logout" onClick={() => handleLogout()}/>
        </div>
    );
}

export default Sidebar;
