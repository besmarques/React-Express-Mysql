import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";

import Teste from "./pages/Teste";

import Navbar from "./component/Navbar";
import Sidebar from "./component/Sidebar";
import Footer from "./component/Footer";

const Layout = () => {
    const basename = /*process.env.REACT_APP_BASENAME ||*/ "";

    return (
        <BrowserRouter basename={basename}>
            <div className="container-fluid d-flex justify-content-between" style={{height:"100vh"}}>
                <div className="col-2">
                    <Sidebar />
                </div>
                <div className="col-10">
                    <div className="row" style={{height:"5vh"}}>
                        <Navbar />
                    </div>
                    <div className="row" style={{height:"90vh"}}>
                        <Routes>
                            <Route element={<Teste />} path="/teste" />
                            <Route element={<h1>Home</h1>} path="/" />
                            <Route element={<h1>Not found!</h1>} path="*" />
                        </Routes>
                    </div>
                    <div className="row" style={{height:"5vh"}}>
                        <Footer />
                    </div>    
                </div>
            </div>
        </BrowserRouter>
    );
};

export default injectContext(Layout);