import React, { useContext } from "react";
import { Context } from "../store/appContext";

function Footer() {
    const { store } = useContext(Context);
    const appName = store.basename || "React Express MySQL";
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer border-top px-3 py-2 d-flex align-items-center justify-content-between text-muted">
            <span>{appName}</span>
            <span>{currentYear}</span>
        </footer>
    );
}

export default Footer;
