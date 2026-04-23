import React from 'react';

const ContentOnlyLayout = ({ children }) => (
    <div className="container-fluid d-flex justify-content-between" style={{height:"100vh"}}>
        <main>
            {children}
        </main>
    </div>
);

export default ContentOnlyLayout;
