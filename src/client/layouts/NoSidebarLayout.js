import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NoSidebarLayout = ({ children }) => (
    <div className="container-fluid d-flex justify-content-between" style={{height:"100vh"}}>
        <div className="col-12">
            <Navbar />
            <div className="row" style={{height:"90vh"}}>
                <main>
                    {children}
                </main>
            </div>
            <div className="row" style={{height:"5vh"}}>
                <Footer />
            </div>
        </div>
    </div>
);
export default NoSidebarLayout;