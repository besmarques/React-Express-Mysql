import React from 'react';

import AppNavbar from "../components/AppNavbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const FullLayout = ({ children }) => (
    <div className="container-fluid d-flex p-0" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
        <aside
            className="h-100 overflow-auto border-end px-3 py-2"
            style={{ width: "clamp(160px, 14vw, 220px)", flexShrink: 0 }}
        >
            <Sidebar />
        </aside>
        <div className="d-flex flex-column h-100 overflow-hidden flex-grow-1">
            <AppNavbar />
            <main className="flex-grow-1 overflow-auto px-3 py-2" style={{ minHeight: 0 }}>
                {children}
            </main>
            <Footer />
        </div>
    </div>
);

export default FullLayout;
