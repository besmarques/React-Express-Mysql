import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

function PublicPreviewBar() {
    const { store, actions } = useContext(Context);

    if (!store.isAuthenticated) {
        return null;
    }

    const handleLogout = async () => {
        await actions.logoutUser();
    };

    return (
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-dark text-white small">
            <span>Previewing the public site while logged in.</span>
            <div className="d-flex align-items-center gap-2">
                <Link to="/admin" className="btn btn-sm btn-outline-light">
                    Back to app
                </Link>
                <button type="button" className="btn btn-sm btn-light" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default PublicPreviewBar;
