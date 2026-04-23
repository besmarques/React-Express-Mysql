import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

function Navbar() {
    const { store } = useContext(Context);
    const appName = store.basename || "React Express MySQL";

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
        </nav>
    );
}

export default Navbar;
