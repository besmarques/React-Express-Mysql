import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../store/appContext";

const CmsEnabledWrapper = ({ children, fallback = null, redirectPath = "/admin" }) => {
    const { store } = useContext(Context);

    if (store.isEnvLoading) {
        return <div>Loading...</div>;
    }

    if (!store.cmsEnabled) {
        if (fallback) {
            return fallback;
        }

        return <Navigate to={redirectPath} />;
    }

    return children;
};

export default CmsEnabledWrapper;
