import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div className="d-flex flex-column">
            this is the sidebar
            <Link to="/home">
                <button type="button">
                    Go to Home
                </button>
            </Link>
            <Link to="/">
                <button type="button">
                    Go to root
                </button>
            </Link>
        </div>
    );
}

export default Sidebar;