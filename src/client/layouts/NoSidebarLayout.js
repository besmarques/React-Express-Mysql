import React from 'react';

import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import PublicNavbar from "../components/PublicNavbar";
import PublicPreviewBar from "../components/PublicPreviewBar";

const NoSidebarLayout = ({ children, navbarVariant = "public" }) => (
    <div className="container-fluid d-flex flex-column p-0" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
        {navbarVariant === "app" ? (
            <AppNavbar />
        ) : (
            <>
                <PublicPreviewBar />
                <PublicNavbar />
            </>
        )}
        <main className="flex-grow-1 overflow-auto px-3 py-2" style={{ minHeight: 0 }}>
            {children}
        </main>
        <Footer />
    </div>
);
export default NoSidebarLayout;
