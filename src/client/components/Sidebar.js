import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
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
        </div>
    );
}

export default Sidebar;