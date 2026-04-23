import React from 'react';

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NoSidebarLayout = ({ children }) => (
    <div className="container-fluid d-flex flex-column p-0" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
        <Navbar />
        <main className="flex-grow-1 overflow-auto px-3 py-2" style={{ minHeight: 0 }}>
            {children}
        </main>
        <Footer />
    </div>
);
export default NoSidebarLayout;
