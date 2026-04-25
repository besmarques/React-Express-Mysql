import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from "../store/appContext";
import { getAdminNavigationItems } from "../modules/moduleRegistry";

const Admin = () => {
    const { store } = useContext(Context);
    const adminModules = getAdminNavigationItems(store);

    return (
        <div className="p-3">
            <h1>Admin</h1>
            {adminModules.map((moduleItem) => (
                <section key={moduleItem.key || moduleItem.to} className="border rounded p-3 mt-3">
                    <h2 className="h5">{moduleItem.label}</h2>
                    <p className="text-muted">{moduleItem.description}</p>
                    <Link to={moduleItem.to} className="btn btn-primary">Open {moduleItem.label}</Link>
                </section>
            ))}
        </div>
    );
}

export default Admin;
