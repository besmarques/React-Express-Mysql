import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";

const ContentOnlyLayout = ({ children }) => (
    <div className="container-fluid d-flex justify-content-between" style={{height:"100vh"}}>
        <main>
            {children}
        </main>
    </div>
);

export default ContentOnlyLayout;