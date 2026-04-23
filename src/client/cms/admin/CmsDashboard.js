import React from "react";
import { Link } from "react-router-dom";
import CmsAdminLayout from "./CmsAdminLayout";

const CmsDashboard = () => (
    <CmsAdminLayout>
        <div className="row g-3">
            <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                    <h2 className="h5">Pages</h2>
                    <p className="text-muted">Create and publish static content pages.</p>
                    <Link to="/admin/cms/pages" className="btn btn-primary">Manage pages</Link>
                </div>
            </div>
            <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                    <h2 className="h5">Posts</h2>
                    <p className="text-muted">Create and publish chronological content posts.</p>
                    <Link to="/admin/cms/posts" className="btn btn-primary">Manage posts</Link>
                </div>
            </div>
            <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                    <h2 className="h5">Media</h2>
                    <p className="text-muted">Upload and reuse files in CMS content.</p>
                    <Link to="/admin/cms/media" className="btn btn-primary">Manage media</Link>
                </div>
            </div>
            <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                    <h2 className="h5">Menus</h2>
                    <p className="text-muted">Build public navigation from CMS content.</p>
                    <Link to="/admin/cms/menus" className="btn btn-primary">Manage menus</Link>
                </div>
            </div>
        </div>
    </CmsAdminLayout>
);

export default CmsDashboard;
