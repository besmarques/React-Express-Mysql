import React from 'react';

const ContentOnlyLayout = ({ children }) => (
    <div className="container-fluid d-flex p-0" style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
        <main className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
            {children}
        </main>
    </div>
);

export default ContentOnlyLayout;
