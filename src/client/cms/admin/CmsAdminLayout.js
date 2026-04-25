import React from "react";
import { Link } from "react-router-dom";
import { cmsAdminNavigationItems } from "../../modules/cmsModule";

const CmsAdminLayout = ({ children }) => (
    <section className="p-3">
        <header className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
            <div>
                <h1 className="h3 mb-1">CMS</h1>
                <p className="text-muted mb-0">Manage pages and posts.</p>
            </div>
            <nav className="d-flex gap-2">
                {cmsAdminNavigationItems.map((item) => (
                    <Link key={item.to} to={item.to} className={item.variant}>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </header>
        {children}
    </section>
);

export default CmsAdminLayout;
