import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from "../store/appContext";

const Admin = () => {
    const { store } = useContext(Context);

    return (
        <div className="p-3">
            <h1>Admin</h1>
            {store.cmsEnabled && (
                <section className="border rounded p-3 mt-3">
                    <h2 className="h5">CMS</h2>
                    <p className="text-muted">Manage CMS pages, posts, and publishing workflow.</p>
                    <Link to="/admin/cms" className="btn btn-primary">Open CMS</Link>
                </section>
            )}
        </div>
    );
}

export default Admin;
