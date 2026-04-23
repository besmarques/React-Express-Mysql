import React from "react";
import { Link } from "react-router-dom";

const CmsAdminLayout = ({ children }) => (
    <section className="p-3">
        <header className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
            <div>
                <h1 className="h3 mb-1">CMS</h1>
                <p className="text-muted mb-0">Manage pages and posts.</p>
            </div>
            <nav className="d-flex gap-2">
                <Link to="/admin/cms" className="btn btn-outline-secondary">Dashboard</Link>
                <Link to="/admin/cms/pages" className="btn btn-outline-primary">Pages</Link>
                <Link to="/admin/cms/posts" className="btn btn-outline-primary">Posts</Link>
                <Link to="/admin/cms/media" className="btn btn-outline-primary">Media</Link>
                <Link to="/admin/cms/terms" className="btn btn-outline-primary">Terms</Link>
                <Link to="/admin/cms/menus" className="btn btn-outline-primary">Menus</Link>
            </nav>
        </header>
        {children}
    </section>
);

export default CmsAdminLayout;
