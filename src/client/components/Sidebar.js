import React, { useContext } from 'react';
import { Context } from "../store/appContext";
import { Link, useNavigate } from 'react-router-dom';
import { getSidebarNavigationItems } from "../modules/moduleRegistry";

import CustomButton from '../components/Button';


function Sidebar() {

    const { store, actions } = useContext(Context); 

    const navigate = useNavigate();
    const moduleItems = getSidebarNavigationItems(store);

    const handleLogout = async () => {
        try {
            await actions.logoutUser();
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    return (
        <nav className="d-flex flex-column">
            <Link to="/" className="block">
                <CustomButton variant="contained" color="primary" name="Go to Home" />
            </Link>
            <Link to="/status" className="block">
                <CustomButton variant="contained" color="primary" name="Go to Status" />
            </Link>
            {moduleItems.length > 0 && (
                <div className="d-flex flex-column gap-2 mt-3">
                    {moduleItems.map((item) => (
                        <Link key={item.to} to={item.to} className="block">
                            <CustomButton variant="contained" color="primary" name={item.label} />
                        </Link>
                    ))}
                </div>
            )}
            <CustomButton variant="contained" color="red" name="Logout" onClick={() => handleLogout()}/>
        </nav>
    );
}

export default Sidebar;
