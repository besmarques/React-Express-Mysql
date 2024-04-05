import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";

import PrivateWrapper from "./components/PrivateWrapper";
import LoginWrapper from "./components/LoginWrapper";

//Layouts
import FullLayout from "./layouts/FullLayout";
import NoSidebarLayout from "./layouts/NoSidebarLayout";
import ContentOnlyLayout from "./layouts/ContentOnly";

//Pages
import Teste from "./pages/Teste";
import Login from "./pages/Login";

const Layout = () => {
    const basename = /*process.env.REACT_APP_BASENAME ||*/ "";

    return (
        <BrowserRouter basename={basename}>
            <Routes>
                <Route path="/login" element={ <LoginWrapper><ContentOnlyLayout> <Login /> </ContentOnlyLayout></LoginWrapper> } />
                <Route path="/teste" element={ <PrivateWrapper><NoSidebarLayout> <Teste /> </NoSidebarLayout></PrivateWrapper> } />
                <Route path="/" element={ <PrivateWrapper><FullLayout> <h1>Home</h1> </FullLayout></PrivateWrapper> } />
                <Route element={<h1>Not found!</h1>} path="*" />
            </Routes>
        </BrowserRouter>
    );
};

export default injectContext(Layout);