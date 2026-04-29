import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

function PublicNavbar() {
    const { store } = useContext(Context);
    const appName = store.appName || "React Express MySQL";

    return (
        <nav className="app-navbar navbar navbar-expand px-3 border-bottom bg-light">
            <span className="navbar-brand mb-0 h1">{appName}</span>
            <div className="ms-auto navbar-nav align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                    Login
                </Link>
            </div>
        </nav>
    );
}

export default PublicNavbar;
