import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../store/appContext";

const FeatureEnabledWrapper = ({
    children,
    fallback = null,
    redirectPath = "/admin",
    featureFlag,
}) => {
    const { store } = useContext(Context);

    if (store.isEnvLoading) {
        return <div>Loading...</div>;
    }

    if (!featureFlag || !store[featureFlag]) {
        if (fallback) {
            return fallback;
        }

        return <Navigate to={redirectPath} />;
    }

    return children;
};

export default FeatureEnabledWrapper;
