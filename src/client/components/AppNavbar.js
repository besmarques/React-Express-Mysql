import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

function AppNavbar() {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const appName = store.appName || "React Express MySQL";

    const handleLogout = async () => {
        try {
            await actions.logoutUser();
        } finally {
            navigate("/login");
        }
    };

    return (
        <nav className="app-navbar navbar navbar-expand px-3 border-bottom bg-light">
            <Link to="/" className="navbar-brand mb-0 h1">
                {appName}
            </Link>
            <div className="navbar-nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/status" className="nav-link">Status</Link>
                <Link to="/admin" className="nav-link">Admin</Link>
            </div>
            <div className="ms-auto">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default AppNavbar;
