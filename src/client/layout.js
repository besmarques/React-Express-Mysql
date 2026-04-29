import React, { Suspense, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";
import { Context } from "./store/appContext";
import { getClientRoutes } from "./modules/moduleRegistry";

const Layout = () => {
    const { store } = useContext(Context);
    const moduleRoutes = getClientRoutes(store);

    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {moduleRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ))}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
