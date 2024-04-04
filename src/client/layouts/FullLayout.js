import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const FullLayout = ({ children }) => (
    <div className="container-fluid d-flex justify-content-between" style={{height:"100vh"}}>
        <div className="col-2">
            <Sidebar />
        </div>
        <div className="col-10">
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

export default FullLayout;