import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";

import FullLayout from "./layouts/FullLayout";
import NoSidebarLayout from "./layouts/NoSidebarLayout";
import ContentOnlyLayout from "./layouts/ContentOnly";

import Teste from "./pages/Teste";
import Login from "./pages/Login";

const Layout = () => {
    const basename = /*process.env.REACT_APP_BASENAME ||*/ "";

    return (
        <BrowserRouter basename={basename}>
            <Routes>
                <Route path="/login" element={ <ContentOnlyLayout> <Login /> </ContentOnlyLayout> } />
                <Route path="/teste" element={ <FullLayout> <Teste /> </FullLayout> } />
                <Route path="/home" element={ <NoSidebarLayout> <h1>Home</h1> </NoSidebarLayout> } />

                <Route element={<h1>Not found!</h1>} path="*" />
            </Routes>
        </BrowserRouter>
    );
};

export default injectContext(Layout);